import {useEffect, useMemo, useState} from 'react';
import {log} from '../logging/logManager';
import {stdTooltip} from '../common/stdTooltip';
import {ShareIcon} from '../common/icons';

export function ShareButton({isLoading, copyCb, text, tooltipText, noCopy}) {
    const [isCopied, setIsCopied] = useState(false);
    const onClick = useMemo(() => {
        return (e) => {
            e.preventDefault();
            let promise = copyCb();
            if (!promise) {
                return;
            }
            promise.then(() => {
                setIsCopied(true);
                log.debug("Copied to clipboard");
            });
        }
    }, [copyCb]);
    useEffect(() => {
        if (isCopied) {
            setTimeout(() => setIsCopied(false), 1000);
        }
    }, [isCopied]);

    const Tag = noCopy ? "span" : "a";
    const tooltipTextDisplay = isCopied ? "Скопійовано!" : noCopy ? null : tooltipText;

    return <Tag href={"#"} onClick={onClick}
                {...stdTooltip(isCopied ? "Скопійовано!" : tooltipTextDisplay)}>
        <small className={isLoading ? " loading" : ""}>
            {text
                ? <><i>{text}</i> {noCopy ? null : <ShareIcon/>}</>
                : ""}
        </small>
    </Tag>
}
