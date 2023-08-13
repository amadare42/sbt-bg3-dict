import {useEffect, useMemo, useState} from 'react';

export function CollapsibleTag({prefix, body, postfix, collapsibleOverride}) {
    let [isCollapsed, setIsCollapsed] = useState(collapsibleOverride);
    useEffect(() => setIsCollapsed(collapsibleOverride), [collapsibleOverride]);
    let toggleOnClicked = useMemo(() => (e) => {
        e.preventDefault();
        setIsCollapsed(!isCollapsed);
    }, [isCollapsed, setIsCollapsed]);
    if (isCollapsed) {
        return <a className={"custom-tag"} onClick={toggleOnClicked}>{body}</a>
    }
    return <a className={"custom-tag"} onClick={toggleOnClicked}>{prefix}<b>{body}</b>{postfix}</a>
}
