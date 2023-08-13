import {useEffect, useState} from 'react';
import {workerWrapper} from './workerWrapper';

export function useWorkerWrapper({setProgress, onInited}) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const onReportProgress = (data) => {
            setProgress(data.progress);
            if (data.progress === "Checking for updates") {
                setIsLoading(true);
            }
        };
        const onInitedCb = (meta) => {
            onInited({meta, worker: workerWrapper});
            setIsLoading(false);
        };
        const dataInitErrorCb = () => {
            workerWrapper.getMeta().then(onInitedCb);
            setIsLoading(false);
        }
        workerWrapper.subscribe('reportProgress', onReportProgress);
        workerWrapper.subscribe('dataInited', onInitedCb);
        workerWrapper.subscribe('dataInitError', dataInitErrorCb);
        let initPromise = workerWrapper.initData(false);
        return () => {
            initPromise.cancel();
            workerWrapper.unsubscribe('reportProgress', onReportProgress);
            workerWrapper.unsubscribe('dataInited', onInitedCb);
            workerWrapper.unsubscribe('dataInitError', dataInitErrorCb);
        }
    }, [onInited, setProgress]);

    return { isLoading };
}
