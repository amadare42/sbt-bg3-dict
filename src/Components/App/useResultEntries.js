import {useEffect, useMemo, useState} from 'react';

export function useResultEntries(worker) {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const searchResultSub = useMemo(() => {
        return ({results}) => {
            setEntries(entries => {
                return entries.concat(results);
            });
        }
    }, []);
    const resetSearchSub = useMemo(() => {
        return () => {
            setEntries([]);
        }
    }, []);

    useEffect(() => {
        if (!worker.subscribe) {
            return
        }
        worker.subscribe('searchResult', searchResultSub);
        worker.subscribe('resetSearch', resetSearchSub);

        return () => {
            worker.unsubscribe('searchResult', searchResultSub);
            worker.unsubscribe('resetSearch', resetSearchSub);
        }
    }, [worker, searchResultSub, resetSearchSub]);

    return { entries, isLoaded: isLoading };
}
