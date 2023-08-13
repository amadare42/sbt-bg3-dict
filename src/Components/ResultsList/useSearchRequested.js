import {useMemo, useState} from 'react';
import {useWorkerSubscription} from '../worker/useWorkerSubscription';

export function useSearchRequested(worker) {
    let [searchRequested, setSearchRequested] = useState(false);
    let resetSearchSub = useMemo(() => () => {
        setSearchRequested(true);
    }, []);
    useWorkerSubscription(worker, "resetSearch", resetSearchSub);
    return searchRequested;
}
