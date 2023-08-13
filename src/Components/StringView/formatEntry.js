import {log} from '../../logging/logManager';

export function formatEntry(text, tagFactory, isFormatting) {
    if (!text) {
        return <span/>;
    }
    if (!isFormatting) {
        return <span>{text}</span>;
    }

    let tags = findTags(text);
    log.debug({tags});
    if (!tags.length) return <span>{text}</span>;


    let parts = [];
    let lastIndex = 0;
    for (let i = 0; i < tags.length; i++) {
        let tag = tags[i];
        let length = tag.index - lastIndex;
        if (length > 0) {
            parts.push(text.slice(lastIndex, tag.index));
            lastIndex = tag.index;
        }
        let match = tag[0];
        let nextTag = tags[i + 1];
        let nextMatch = nextTag && nextTag[0];

        try {
            if (match === "<i>") {
                if (nextTag && nextMatch.startsWith("</i>")) {
                    parts.push(<i key={i}>{text.slice(tag.index + 3, nextTag.index)}</i>);
                    lastIndex = nextTag.index + nextMatch.length;
                    i++;
                }
            } else if (match === "<b>") {
                if (nextTag && nextMatch.startsWith("</b>")) {
                    parts.push(<b key={i}>{text.slice(tag.index + 3, nextTag.index)}</b>);
                    lastIndex = nextTag.index + nextMatch.length;
                    i++;
                }
            } else if (match === "<br>") {
                parts.push(<br key={i}/>);
                lastIndex += match.length;
            } else if (match.startsWith("[")) {
                parts.push(<span key={i} className={"custom-square-tag"}>{match}</span>);
                lastIndex += match.length;
            } else {
                if (match.endsWith("/>")) {
                    parts.push(<span key={i} className={"custom-tag"}>{match}</span>);
                    lastIndex += match.length;
                    continue;
                }

                let tagName = match.slice(1).split(" ")[0];
                if (nextTag && nextMatch.startsWith("</" + tagName)) {
                    parts.push(tagFactory({
                        prefix: match,
                        body: text.slice(tag.index + match.length, nextTag.index),
                        postfix: nextMatch,
                        key: i
                    }));

                    lastIndex = nextTag.index + nextMatch.length;
                    i++;
                }
            }
        } catch (e) {
            // if fancy formatting fails, not parsed tags will be shown as plain text
            console.log("error on parsing tag", e);
        }
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return <span>{parts}</span>;
}

function findTags(text) {
    let tags = [];
    let tagRegex = /(<[^>]+>|(\[[^ \]]+]))/g;
    let match = tagRegex.exec(text);
    while (match) {
        tags.push(match);
        match = tagRegex.exec(text);
    }
    return tags;
}
