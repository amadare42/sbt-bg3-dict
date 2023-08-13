import {useMemo, useRef} from 'react';
import {useWorkerSubscription} from '../worker/useWorkerSubscription';

export function LoadingProgress({worker}) {
    const loadingRef = useRef();
    const searchProgressSub = useMemo(() => {
        return (progress) => {
            if (loadingRef.current) {
                loadingRef.current.style.width = progress + '%';
                if (progress == 100) {
                    loadingRef.current.classList.add('hidden');
                } else {
                    loadingRef.current.classList.remove('hidden');
                }
            }
        }
    }, []);
    useWorkerSubscription(worker, 'searchProgress', searchProgressSub);
    return <div className={"SearchBlock-loading"} ref={loadingRef}></div>;
}


