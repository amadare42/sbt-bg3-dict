import './search-block.scss';


import {useEffect, useMemo, useRef} from 'react';
import {SimpleSelector} from '../SimpleSelector';
import classNames from 'classnames';
import {SearchBlockButtons} from './SearchBlockButtons';
import {LoadingProgress} from './LoadingProgress';
import {parseUrl, updateUrlComponent, updateUrlForState} from '../../common/searchStateUrl';
import {loggerForComponent} from '../../logging/logManager';
import {stdTooltip} from '../../common/stdTooltip';
import {SearchIcon, SpinnerDarkIcon, SpinnerIcon, SwitchIcon} from '../../common/icons';

let log = loggerForComponent(SearchBlock);

export function SearchBlock({
                                worker,
                                meta,
                                currentLang,
                                setCurrentLang,
                                setTargetLang,
                                searchState,
                                isLoading,
                                activeEntryIdx,
                                setActiveEntryIdx,
                                theme
                            }) {
    const {
        caseSensitive, setCaseSensitive,
        regex, setRegex,
        query, setQuery,
        byId, setById
    } = searchState;

    const setByIdOverride = useMemo(() => {
        return (value) => {
            setById(value);
            if (value) {
                setRegex(false);
                setCaseSensitive(false);
            }
        }
    }, [setById, setRegex, setCaseSensitive]);
    const setRegexOverride = useMemo(() => {
        return (value) => {
            setRegex(value);
            if (value) {
                setById(false);
            }
        }
    }, [setRegex, setById]);
    const setCaseSensitiveOverride = useMemo(() => {
        return (value) => {
            setCaseSensitive(value);
            if (value) {
                setById(false);
            }
        }
    }, [setCaseSensitive, setById]);

    // set error state if regex is invalid
    const queryError = useMemo(() => {
        if (regex) {
            return !isRegexValid(query);
        }
    }, [regex, query]);
    const onSubmit = useMemo(() => {
        return e => {
            e.preventDefault();
            if (queryError) {
                return;
            }
            log.debug("onSubmit", {query, regex, caseSensitive, byId});
            updateUrlForState({query, regex, caseSensitive, byId}, currentLang);
            worker.search(currentLang, {query, regex, caseSensitive, byId});
            setActiveEntryIdx(0);
        }
    }, [worker, query, regex, caseSensitive, currentLang, byId, queryError]);
    const toggleCurrentLang = useMemo(() => {
        return () => {
            let idx = meta.languages.indexOf(currentLang);
            idx = (idx + 1) % meta.languages.length;
            setCurrentLang(meta.languages[idx]);
        }
    }, [meta.languages, currentLang, setCurrentLang, searchState, activeEntryIdx]);

    // set default languages
    useEffect(() => {
        if (!currentLang && meta && meta.languages.length) {
            setCurrentLang(meta.languages[0]);
            setTargetLang(meta.languages[1] || meta.languages[0]);
        }
    }, [meta, currentLang]);

    // update url when search state changed
    useEffect(() => {
        updateUrlComponent("case", caseSensitive);
        updateUrlComponent("regex", regex);
        updateUrlComponent("byId", byId);
        if (currentLang) {
            updateUrlComponent("s_lang", currentLang);
        }
    }, [caseSensitive, regex, byId, currentLang]);

    // auto search when url changed
    useEffect(() => {
        const rq = parseUrl();
        if (rq.query) {
            setById(rq.byId);
            setQuery(rq.query);
            setRegex(rq.regex);
            setCaseSensitive(rq.caseSensitive);
        }

        if (!meta.languages.length || !worker.subscribe) {
            return;
        }

        if (rq.query) {
            worker.search(rq.searchLang ?? meta.languages[0], {
                query: rq.query,
                regex: rq.regex,
                caseSensitive: rq.caseSensitive,
                byId: rq.byId
            });
            setActiveEntryIdx(rq.activeIdx === null ? 0 : rq.activeIdx);
        }
    }, [meta.languages, setById, setQuery, worker]);

    let Spinner = theme === "dark" ? SpinnerDarkIcon : SpinnerIcon;

    return (
        <div className="SearchBlock-wrapper">
            <div className={classNames("SearchBlock-search application-block", {error: queryError})}>
                <LoadingProgress worker={worker}/>
                <form onSubmit={onSubmit}>
                    <button className={"btn-base btn-search"} type={"submit"} title={"Пошук"} disabled={isLoading}>
                        {isLoading ? <Spinner className={"SearchBlock-spinner"}/> :
                            <SearchIcon className={classNames("search-icon")}/>}
                    </button>
                    <SearchInput query={query} setQuery={setQuery}/>
                </form>
                <SearchBlockButtons regex={regex} caseSensitive={caseSensitive} byId={byId}
                                    setRegex={setRegexOverride} setCaseSensitive={setCaseSensitiveOverride}
                                    setById={setByIdOverride}
                                    hasText={!!query}/>
            </div>
            <div className={"SearchBlock-lang application-block"}>
                <SimpleSelector clsNames={{control: ctrlCls, container: ctrlCls}} values={meta.languages}
                                targetValue={currentLang} setTargetValue={setCurrentLang} placeholder={"Мова"}/>
                <button {...stdTooltip("Переключити мову пошуку")} className={"btn-base switch-langs-button"}
                        onClick={toggleCurrentLang}>
                    <SwitchIcon/>
                </button>
            </div>
        </div>
    );
}

function SearchInput({ query, setQuery }) {
    const searchInputRef = useAutofocus();

    return <input type="text" placeholder="Пошук..." value={query}
                  ref={searchInputRef}
                  onInput={e => setQuery(e.target.value)}/>
}

function isRegexValid(regex) {
    try {
        new RegExp(regex);
        return true;
    } catch (e) {
        return false;
    }
}

function ctrlCls() {
    return "ctrl";
}

function useAutofocus() {
    const ref = useRef();
    useEffect(() => {
        ref.current.focus();
    }, [ref]);

    return ref;
}

