import {useEffect, useRef} from 'react';

export function useWorkerSubscription(worker, event, callback) {
    const callbackRef = useRef();
    callbackRef.current = callback;
    useEffect(() => {
        if (!worker.subscribe) {
            return
        }
        worker.subscribe(event, callbackRef.current);
        return () => {
            worker.unsubscribe(event, callbackRef.current);
        }
    }, [worker, event]);
}
