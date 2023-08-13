import './App.scss';

import {useMemo, useState} from 'react';
import {StatusBar} from '../StatusBar/StatusBar';
import {useWorkerWrapper} from '../../worker/useWorkerWrapper';
import {SearchBlock} from '../SearchBlock/SearchBlock';
import {ResultsList} from '../ResultsList/ResultsList';
import {StringView} from '../StringView/StringView';
import {useResultEntries} from './useResultEntries';
import {useCorrectViewport} from './useCorrectViewport';
import {parseUrl} from '../../common/searchStateUrl';
import {useSearchState} from './useSearchState';
import {Tooltip} from 'react-tooltip';
import {useColorTheming} from './useColorTheming';
import {useWorkerSubscription} from '../worker/useWorkerSubscription';


function App() {
    useCorrectViewport();
    let rq = useMemo(() => parseUrl(), [window.location.href]);
    const [compareMode, setCompareMode] = useState(false);

    const { theme, toggleTheme } = useColorTheming();

    let [state, setState] = useState('Initial');
    let [{worker, meta}, setWorkerData] = useState({meta: {languages: []}, worker: {}});
    let {isLoading} = useWorkerWrapper({setProgress: setState, onInited: setWorkerData});

    let disabledCompareMode = useMemo(() => () => setCompareMode(false), []);
    useWorkerSubscription(worker, "searchFinished", disabledCompareMode);

    const {entries} = useResultEntries(worker);

    let [currentLang, setCurrentLang] = useState(null);
    let [targetLang, setTargetLang] = useState(rq?.targetLang || null);

    let [activeEntryIdx, setActiveEntryIdx] = useState(rq.activeId !== null ? parseInt(rq.activeIdx) : 0);
    let activeEntry = entries[activeEntryIdx] || null;
    const searchState = useSearchState(rq);


    return (
        <div className="App">
            <StatusBar state={state} worker={worker} meta={meta} toggleTheme={toggleTheme} />
            <SearchBlock worker={worker} meta={meta} currentLang={currentLang} isLoading={isLoading}
                         theme={theme}
                         setCurrentLang={setCurrentLang} setTargetLang={setTargetLang} searchState={searchState}
                         setActiveEntryIdx={setActiveEntryIdx} activeEntryIdx={activeEntryIdx}/>
            <div>
                { compareMode ? <StringView selectedEntry={activeEntry} currentLang={currentLang}
                            defaultTargetLang={currentLang}
                            setCompareMode={setCompareMode}
                            worker={worker} meta={meta} isTopPanel={compareMode}/> : null }
                <ResultsList worker={worker} entries={entries} isLoading={isLoading} currentLang={currentLang}
                             searchState={searchState} rq={rq} compareMode={compareMode}
                             activeEntryIdx={activeEntryIdx} setActiveEntryIdx={setActiveEntryIdx}/>
                <StringView selectedEntry={activeEntry} currentLang={currentLang} defaultTargetLang={targetLang}
                            compareMode={compareMode} setCompareMode={setCompareMode}
                            worker={worker} meta={meta}/>
            </div>
            <Tooltip id="tooltip"/>
            <Tooltip id="copied-tooltip" variant={"info"}/>
        </div>
    );
}

export default App;
