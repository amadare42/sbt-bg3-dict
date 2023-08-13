export function ResultEntry({entry, onClick, active, idx}) {
    let postfix = active ? ' active' : '';
    return <a role={"button"} href={"#"} className={"ResultsList-entry" + postfix} onClickCapture={onClick}
              data-idx={idx}>
        {EntryText({entry})}
    </a>
}

function EntryText({entry}) {
    let match = entry.match;
    let text = entry.Text;

    if (match.start === -1) {
        return <span className={"ResultsList-entry-text"}>{text}</span>
    }

    let matchLength = match.end - match.start;
    if (!matchLength) {
        return <span className={"ResultsList-entry-text"}>
            {text}
        </span>
    }

    return <span className={"ResultsList-entry-text"}>
        {text.substring(0, match.start)}
        <mark>{text.substring(match.start, match.end)}</mark>
        {text.substring(match.end)}
    </span>
}
