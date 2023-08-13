import { logManager } from '../logging/logManager';

const log = logManager.getLogger('proxy');

export function createCallingProxy(worker) {
    let promises = {};
    let subscriptions = {};
    let id = 0;

    worker.onmessage = (event) => {
        let {key, data} = event.data;
        log.debug(key, data, event);
        if (key === 'call_result') {
            let {id, result: {isError, value}} = data;

            if (isError) {
                promises[id].reject(value);
            } else {
                promises[id].resolve(value);
            }

            delete promises[id];
        }
        else {
            if (subscriptions[key]) {
                subscriptions[key].forEach(x => x(data));
            }
        }
    }

    function subscribe(key, callback) {
        if (!subscriptions[key]) {
            subscriptions[key] = [];
        }
        subscriptions[key].push(callback);
    }

    function unsubscribe(key, callback) {
        if (!subscriptions[key]) {
            return;
        }
        subscriptions[key] = subscriptions[key].filter(x => x !== callback);
    }

    return new Proxy({}, {
        get: function (target, prop) {
            // return worker if prop is 'worker'
            switch (prop) {
                case 'worker':
                    return worker;
                case 'subscribe':
                    return subscribe;
                case 'unsubscribe':
                    return unsubscribe;
            }
            return function (...args) {
                let currentId = id++;
                let promise = new Promise((resolve, reject) => {
                    promises[currentId] = {resolve, reject};
                    worker.postMessage({key: 'call', data: {id: currentId, fn: prop, args}});
                });
                promise.cancel = () => {
                    log.debug('cancel', currentId);
                    return worker.postMessage({key: 'cancel', data: {id: currentId}});
                };
                return promise;
            };
        }
    });
}
