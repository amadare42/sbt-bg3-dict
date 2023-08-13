import useLocalStorage from '../../common/useLocalStorage';
import {useState} from 'react';

export function useSearchState(rq) {
    // const [caseSensitive, setCaseSensitive] = useLocalStorage("searchBlock.caseSensitive", false);
    // const [regex, setRegex] = useLocalStorage("searchBlock.regex", false);
    // const [query, setQuery] = useLocalStorage('searchBlock.query', '');
    // const [byId, setById] = useLocalStorage("searchBlock.byId", false);

    const [caseSensitive, setCaseSensitive] = useState(rq.caseSensitive || false);
    const [regex, setRegex] = useState(rq.regex || false);
    const [query, setQuery] = useState(rq.query || '');
    const [byId, setById] = useState(rq.byId || false);

    return {caseSensitive, setCaseSensitive, regex, setRegex, query, setQuery, byId, setById};
}
