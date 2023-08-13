import './StringView.scss';

import {useEffect, useMemo, useState} from 'react';
import {SimpleSelector} from '../SimpleSelector';
import {formatEntry} from './formatEntry';
import useLocalStorage from '../../common/useLocalStorage';
import {FileSelector} from './FileSelector';
import {CollapsibleTag} from './CollapsibleTag';
import {urlFromSearchState} from '../../common/searchStateUrl';
import {ShareButton} from '../ShareButton';
import {stdTooltip} from '../../common/stdTooltip';
import {CompareIcon, SwitchIcon, TextIcon, XmlIcon} from '../../common/icons';
import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import {useWorkerSubscription} from '../worker/useWorkerSubscription';

export function StringView({
                               selectedEntry,
                               currentLang,
                               worker,
                               meta,
                               defaultTargetLang,
                               isTopPanel,
                               compareMode,
                               setCompareMode
                           }) {
    let [entries, setEntries] = useState([]);
    let [isLoading, setIsLoading] = useState(false);

    let [targetLang, setTargetLang] = useState(defaultTargetLang);
    let [isFormatting, setIsFormatting] = useLocalStorage("StringView.formatting", true);
    let toggleFormatting = useMemo(() => () => setIsFormatting(!isFormatting), [isFormatting, setIsFormatting]);

    let entryOptions = useMemo(() => entries.map(entry => ({
        value: entry.fileName,
        label: entry.fileName
    })) || [], [entries]);
    let [activeEntry, setActiveEntry] = useState(null);
    useEffect(() => {
        setActiveEntry(entryOptions[0]);
    }, [entryOptions]);

    useEffect(() => {
        if (selectedEntry && selectedEntry.ContentId) {
            setIsLoading(true);
            worker.findById(targetLang, selectedEntry.ContentId)
                .then((entries) => {
                    setEntries(entries);
                    setIsLoading(false);
                })
                .catch(() => {
                    setEntries([]);
                    setIsLoading(false);
                });
        }
    }, [selectedEntry, setIsLoading, targetLang, currentLang, worker]);

    let nextLang = useMemo(() => {
        return () => {
            let idx = meta.languages.indexOf(targetLang);
            idx = (idx + 1) % meta.languages.length;
            setTargetLang(meta.languages[idx]);
        }
    }, [meta.languages, targetLang]);

    let [collapsibleOverride, setCollapsibleOverride] = useState(true);
    let toggleCollapsibleOverride = useMemo(() => () => setCollapsibleOverride(!collapsibleOverride), [collapsibleOverride, setCollapsibleOverride]);
    let collapsibleTagFactory = useMemo(() => {
        return ({prefix, body, postfix, key}) => {
            return <CollapsibleTag prefix={prefix} body={body} postfix={postfix} key={key}
                                   collapsibleOverride={collapsibleOverride}/>
        }
    }, [collapsibleOverride]);

    let copyContentRefUrlToClipboard = useMemo(() => {
        return () => {
            let url = urlFromSearchState({
                query: selectedEntry.ContentId,
                byId: true,
                lang: targetLang
            }, currentLang, 0);
            return clipboardCopy(url);
        }
    }, [selectedEntry?.ContentId, targetLang, currentLang]);

    let resetSearch = useMemo(() => () => {
        setEntries([]);
        setActiveEntry(null);
    }, []);
    useWorkerSubscription(worker, "resetSearch", resetSearch);


    return <div
        className={classNames("application-block StringView", {"panel-bottom": !isTopPanel, "panel-top": isTopPanel})}>
        <div className={"StringView-selects"}>
            <SimpleSelector placeholder={'Мова'} defaultIndex={1} cls={'a'} values={meta.languages}
                            targetValue={targetLang}
                            setTargetValue={setTargetLang}/>
            <button {...stdTooltip("Переключити мову відображення")} className={"btn-base switch-langs-button"}
                    onClick={nextLang}>
                <SwitchIcon/>
            </button>
            <FileSelector entries={entries} activeEntry={activeEntry} setActiveEntry={setActiveEntry}
                          targetLang={targetLang}/>
            <button onClick={toggleFormatting}
                    data-tooltip-id="tooltip" data-tooltip-content="Форматувати"
                    className={"btn-base switch-langs-button first" + (isFormatting ? " enabled" : "")}>
                <TextIcon width={24} height={24}/>
            </button>
            <button {...stdTooltip("Згортати теґи")} onClick={toggleCollapsibleOverride}
                    className={"btn-base switch-langs-button" + (collapsibleOverride ? " enabled" : "")}>
                <XmlIcon width={24} height={24}/>
            </button>
            {
                isTopPanel ? null :
                    <button {...stdTooltip("Режим порівняння")} onClick={e => setCompareMode(c => !c)}
                            className={"btn-base switch-langs-button" + (compareMode ? " enabled" : "")}>
                        <CompareIcon width={24} height={24}/>
                    </button>
            }
        </div>
        <p className={"StringView-text" + (isLoading ? " loading" : "")}>
            {activeEntry ? formatEntry(activeEntry.Text, collapsibleTagFactory, isFormatting) :
                <div className={"noentry-placeholder"}><span>(нема запису)</span></div>}
        </p>

        {
            !isTopPanel ?
                <ShareButton
                    isLoading={isLoading}
                    copyCb={copyContentRefUrlToClipboard}
                    text={activeEntry?.ContentId}
                    tooltipText={"Копіювати посилання на стічку"}/>
                : null
        }
    </div>
}
