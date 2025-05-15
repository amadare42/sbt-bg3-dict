const gzip = require('gzip-js');// worker.js
const localforage = require('localforage');
let rootUrl = "";

class WorkerLogic {

    hasUpdates = false;
    constructor() {
        this.dataPromise = new Promise(r => {
            this.dataPromiseResolve = r;
        });
    }

    getMeta = async () => {
        let meta = await localforage.getItem("cachedMeta");
        meta.hasUpdates = this.hasUpdates;
        meta.languages = this.data ? Object.keys(this.data) : [];
        return meta;
    };

    fetchData = async (partsCount) => {
        this.reportProgress("Fetching data");
        let promises = [];
        for (let i = 0; i < partsCount; i++) {
            promises.push(
                fetch(
                    `${rootUrl}/combined.${i.toString().padStart(2, "0")}.bin`
                ).then((e) => e.arrayBuffer())
            );
        }
        let buffers = await Promise.all(promises);
        return buffers;
    }

    decompress = async (arrayBuffers) => {
        this.reportProgress("Decompressing");
        let binaryData = arrayBuffers.reduce(appendBuffer);

        // Create a decompression stream
        // eslint-disable-next-line no-undef
        const ds = new DecompressionStream('gzip');

        // Create readable stream from the compressed data
        const readableStream = new Response(binaryData).body;

        // Pipe through the decompression stream
        const decompressedStream = readableStream.pipeThrough(ds);

        // Get the decompressed data as an ArrayBuffer
        const response = new Response(decompressedStream);
        const unzipped = await response.arrayBuffer();

        return unzipped;
    }

    decode = async (unzipped) => {
        this.reportProgress("Decoding");
        let bytesView = new Uint8Array(unzipped);
        let decodedStr = new TextDecoder().decode(bytesView);
        return decodedStr;
    }

    parseJson = async (decodedStr) => {
        this.reportProgress("Parsing");
        let data = JSON.parse(decodedStr);
        return data;
    }

    initData = async (forceUpdate, ct) => {
        try {
            ct.throwIfCancelled();
            this.reportProgress("Checking for updates");
            const meta = await fetch(`${rootUrl}/combined.meta.json`).then((e) => e.json());
            ct.throwIfCancelled();

            const cachedMeta = await localforage.getItem("cachedMeta");
            if (meta.sum === cachedMeta?.sum && !forceUpdate) {
                this.reportProgress("Fetching cached data");
                this.data = await localforage.getItem("cachedData");
                cachedMeta.date = meta.date;
                await localforage.setItem("cachedMeta", cachedMeta);
                this.reportProgress("Ready");
                this.dataPromiseResolve();
                postMessage({key: "dataInited", data: await this.getMeta()});
                return;
            }
            this.hasUpdates = true;

            const buffers = await this.fetchData(meta.count);
            ct.throwIfCancelled();
            const unzipped = await this.decompress(buffers);
            ct.throwIfCancelled();
            const decodedStr = await this.decode(unzipped);
            ct.throwIfCancelled();
            this.data = await this.parseJson(decodedStr);
            await localforage.setItem("cachedMeta", meta);
            await localforage.setItem("cachedData", this.data);
            this.hasUpdates = false;
            this.reportProgress("Ready");
            this.dataPromiseResolve();
            postMessage({key: "dataInited", data: await this.getMeta()});
        } catch (e) {
            if (e.message === "Operation cancelled") {
                return;
            }

            this.data = await localforage.getItem("cachedData");
            console.error(e);
            this.reportProgress("Error");
            postMessage({key: "dataInitError", data: e.message});
        }
    };

    findById = async (lang, id, ct) => {
        await this.dataPromise;
        ct.throwIfCancelled();

        const langFiles = this.data[lang];
        if (!langFiles) {
            return [];
        }
        let entries = [];
        for (let fileName of Object.keys(langFiles)) {
            for (let entry of langFiles[fileName].ContentNodes) {
                if (entry.ContentId === id) {
                    entries.push({...entry, fileName});
                }
            }
        }
        return entries;
    }

    search = async (lang, {query, regex, caseSensitive, byId}, ct) => {
        await this.dataPromise;

        postMessage({key: "resetSearch"});
        const langFiles = this.data[lang];
        let totalEntries = Object.keys(langFiles).reduce((acc, key) => acc + langFiles[key].ContentNodes.length, 0);
        let entriesProcessed = 0;
        let resultsBuffer = [];
        let regexQuery = new RegExp(query, caseSensitive ? "" : "i");
        for (let fileName of Object.keys(langFiles)) {
            for (let entry of langFiles[fileName].ContentNodes) {
                let match = {isMatched: false, start: 0, end: 0};
                if (!query) {
                    match.isMatched = true;
                    match.start = -1;
                    match.end = -1;
                } else if (byId) {
                    if (entry.ContentId.includes(query)) {
                        match.isMatched = true;
                        match.start = -1;
                        match.end = -1;
                    }
                } else if (!regex) {
                    if (caseSensitive) {
                        let idx = entry.Text.indexOf(query);
                        if (idx !== -1) {
                            match.isMatched = true;
                            match.start = idx;
                            match.end = idx + query.length;
                        }
                    } else {
                        let idx = entry.Text.toLowerCase().indexOf(query.toLowerCase());
                        if (idx !== -1) {
                            match.isMatched = true;
                            match.start = idx;
                            match.end = idx + query.length;
                        }
                    }
                } else {
                    regexQuery.lastIndex = 0;
                    match.isMatched = regexQuery.test(entry.Text);
                    if (match.isMatched) {
                        let matchResult = regexQuery.exec(entry.Text);
                        match.start = matchResult.index;
                        match.end = matchResult.index + matchResult[0].length;
                    }
                }

                if (match.isMatched) {
                    resultsBuffer.push({fileName, ...entry, match});
                }
                entriesProcessed++;

                if (resultsBuffer.length > 100) {
                    ct.throwIfCancelled();
                    postMessage({key: "searchResult", data: {results: resultsBuffer, finished: false}});
                    postMessage({key: "searchProgress", data: entriesProcessed / totalEntries * 100})
                    resultsBuffer = [];
                }
            }
        }
        postMessage({key: "searchResult", data: {results: resultsBuffer, finished: true}});
        postMessage({key: "searchProgress", data: 100})
        postMessage({key: "searchFinished", data: null });
    }

    reportProgress = (progress) => {
        postMessage({key: "reportProgress", data: {progress}});
    };
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function appendBuffer(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp;
}

var logic = new WorkerLogic();

const cancellationTokens = {};

class CancellationToken {

    isCancelled = false;

    constructor(id) {
        this.id = id;
    }

    cancel() {
        this.isCancelled = true;
    }

    throwIfCancelled() {
        if (this.isCancelled) {
            throw new Error("Operation cancelled");
        }
    }
}

onmessage = (event) => {
    let payload = event.data;
    let data = payload?.data;

    console.log({ key: payload.key, cancellationTokens });

    switch (payload.key) {
        case "init":
            rootUrl = event.data.payload.rootUrl;
            break;

        case "cancel":
            cancellationTokens[data.id]?.cancel();
            break;
        case "call":
            let fun = logic[payload.data.fn];
            if (fun && typeof fun === "function") {
                try {
                    let token = cancellationTokens[data.id] = new CancellationToken(data.id);
                    const result = fun(...data.args, token);
                    if (result instanceof Promise) {
                        result.then((value) => {
                            postMessage({
                                key: "call_result",
                                data: {id: data.id, result: {isError: false, value}},
                            });
                        }).catch((error) => {
                            postMessage({
                                key: "call_result",
                                data: {id: data.id, result: {isError: true, value: error}},
                            });
                        }).then(() => delete cancellationTokens[data.id]);
                    } else {
                        postMessage({
                            key: "call_result",
                            data: {id: data.id, result: {isError: false, value: result}},
                        });
                        delete cancellationTokens[data.id]
                    }
                } catch (e) {
                    postMessage({
                        key: "call_result",
                        data: {id: data.id, result: {isError: true, value: e}},
                    });
                    delete cancellationTokens[data.id]
                }
            } else {
                postMessage({
                    key: "call_result",
                    data: {id: data.id, result: {isError: true, value: "Function not found"}},
                });
            }
            break;
    }
};
