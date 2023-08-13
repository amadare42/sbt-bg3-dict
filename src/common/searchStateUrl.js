import {log} from '../logging/logManager';

export function parseUrl() {
    let url = new URL(window.location.href);
    let targetLang= url.searchParams.get("lang");
    let searchLang = url.searchParams.get("s_lang");
    let caseSensitive = url.searchParams.get('case') === 'true';
    let regex = url.searchParams.get('regex') === 'true';
    let byId = url.searchParams.get('byId') === 'true';
    let query = url.searchParams.get('query');
    let activeIdx = url.searchParams.get("idx");
    activeIdx = parseInt(activeIdx);
    if (isNaN(activeIdx)) {
        activeIdx = null;
    }

    let obj = {query, caseSensitive, regex, byId, searchLang, targetLang, activeIdx};
    log.debug("parseUrl", obj);
    return obj;
}

export function updateUrlForState(searchState, searchLang, activeIdx) {
    let url = urlFromSearchState(searchState, searchLang, activeIdx);
    if (window.location.href === url) {
        return;
    }
    log.debug("pushed", url);
    window.history.pushState({}, "", url);
}


/**
 * @typedef {"lang" | "s_lang" | "case" | "regex" | "byId" | "query" | "idx"} AppUrlComponent
 * @param {AppUrlComponent} key
 * @param value
 */
export function updateUrlComponent(key, value) {
    let url = new URL(window.location.href);
    if (defaultValues[key] === value) {
        url.searchParams.delete(key);
    }
    else {
        url.searchParams.set(key, value);
    }
    window.history.pushState({}, "", url.href);
}

const defaultValues = {
    case: false,
    regex: false,
    byId: false,
    query: "",
    searchLang: null,
    targetLang: null,
    activeIdx: null
}


export function urlFromSearchState(searchState, searchLang, activeIdx) {
    let url = new URL(window.location.href.split('?')[0]);
    const {caseSensitive, regex, byId, query} = searchState;

    if (caseSensitive) {
        url.searchParams.set("case", caseSensitive);
    }
    if (regex) {
        url.searchParams.set("regex", regex);
    }
    if (byId) {
        url.searchParams.set("byId", byId);
    }
    if (searchLang) {
        url.searchParams.set("s_lang", searchLang);
    }
    url.searchParams.set("query", query);
    if (activeIdx || activeIdx === 0) {
        url.searchParams.set("idx", activeIdx);
    }

    return url.href;
}
