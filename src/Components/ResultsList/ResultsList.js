import "./ResultsList.scss";

import List from "react-virtualized/dist/commonjs/List";
import {AutoSizer} from 'react-virtualized';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useWorkerSubscription} from '../worker/useWorkerSubscription';
import {updateUrlComponent, urlFromSearchState} from '../../common/searchStateUrl';
import {ResultEntry} from './ResultEntry';
import {LoadingOverlay} from '../LoadingOverlay/LoadingOverlay';
import {ShareButton} from '../ShareButton';
import {logManager} from '../../logging/logManager';
import classNames from 'classnames';
import {ResultsPlaceholder} from './Placeholder';
import clipboardCopy from 'clipboard-copy';

const log = logManager.getLogger("ResultsList");

export function ResultsList({worker, entries, setActiveEntryIdx, activeEntryIdx, isLoading, currentLang, searchState, rq, compareMode }) {

    const onClick = useMemo(() => {
        return (e) => {
            e.preventDefault();
            let idx = Number(e.currentTarget.dataset.idx);
            setActiveEntryIdx(idx);
            updateUrlComponent("idx", idx);
        }
    }, [setActiveEntryIdx]);

    const list = useRef();
    const rowRenderer = useRowRenderer(entries, activeEntryIdx, onClick);
    useSelectFirstItemOnFinish(worker, activeEntryIdx, setActiveEntryIdx, list, rq, entries);

    const copyContentRefUrlToClipboard = useMemo(() => {
        return () => {
            const id = entries[activeEntryIdx]?.ContentId;
            if (!id) {
                return;
            }

            let url = urlFromSearchState(searchState, currentLang, activeEntryIdx);
            let promise = clipboardCopy(url);
            window.history.pushState({}, "", url);
            return promise;
        }
    }, [currentLang, searchState, entries, activeEntryIdx ]);

    // redraw list on compare mode change
    useEffect(() => {
        if (!compareMode) {
            list.current.forceUpdateGrid();
        }
    }, [compareMode, list]);

    return <div className={classNames("application-block ResultsList panel-top", { hidden: compareMode })}>
        <AutoSizer>
            {({width, height}) =>
                <List
                    ref={list}
                    key={"LIST"}
                    rowCount={entries.length}
                    rowHeight={100}
                    width={width}
                    height={height}
                    rowRenderer={rowRenderer}
                ></List>}
        </AutoSizer>
        <div className="ResultsList-status">
            <ShareButton
                isLoading={isLoading}
                copyCb={copyContentRefUrlToClipboard}
                text={`Записів: ${entries.length}`}
                noCopy={entries.length === 0}
                tooltipText={"Копіювати посилання на результати пошуку"} />
        </div>
        <LoadingOverlay isLoading={isLoading} />
        <ResultsPlaceholder isVisible={!isLoading && !(entries?.length)} />
    </div>
}

function useRowRenderer(entries, activeEntryIdx, onClick) {
    log.debug("useRowRenderer", activeEntryIdx);
    return useMemo(() => {
        return ({index, key, style}) => {
            let entry = entries[index];
            let active = index === activeEntryIdx;
            return <div key={key} style={style}>
                <ResultEntry entry={entry} onClick={onClick} active={active} idx={index}/>
            </div>
        }
    }, [entries, activeEntryIdx, onClick]);
}

function useSelectFirstItemOnFinish(worker, activeEntryIdx, setActiveEntryIdx, list, rq, entries) {
    const [shouldScroll, setShouldScroll] = useState(false);
    const [isFirst, setIsFirst] = useState(true);
    const [scrolledByRequest, setScrolledByRequest] = useState(false);

    if (shouldScroll) {
        if (!scrolledByRequest) {
            list.current.scrollToRow(0);
            log.debug("SCROLLED");
        }
        setShouldScroll(false);
    }

    useEffect(() => {
        log.debug("useSelectFirstItemOnFinish", rq.activeIdx, isFirst, entries?.length);
        if (!isFirst) return;

        if (rq.activeIdx !== null && (entries?.length || 0) > rq.activeIdx) {
            setActiveEntryIdx(rq.activeIdx);
            setTimeout(() => list.current.scrollToRow (rq.activeIdx), 100);
            setIsFirst(false);
            setScrolledByRequest(true);
            log.debug("scrolled to", rq.activeIdx);
        }
    }, [entries?.length, isFirst, list, rq, setActiveEntryIdx]);

    const resetSearchSub = useMemo(() => () => {
        if (isFirst) return;
        setShouldScroll(true);
        setActiveEntryIdx(0);
    }, [setActiveEntryIdx, isFirst]);
    const searchFinishedSub = useMemo(() => () => {
        setShouldScroll(true);
    }, []);
    useWorkerSubscription(worker, 'resetSearch', resetSearchSub);
    useWorkerSubscription(worker, 'searchFinished', searchFinishedSub);
}
