import classNames from 'classnames';
import {stdTooltip} from '../../common/stdTooltip';

export function SearchBlockButtons({
                                       regex,
                                       caseSensitive,
                                       byId,
                                       setRegex,
                                       setCaseSensitive,
                                       setById
                                   }) {
    return <div className="SearchBlock-buttons">

        <div className={classNames('collapsible-block')}>
            <button {...stdTooltip("Шукати з RegExp")} className={classNames("btn-base", { enabled: regex })}
                    onClick={e => setRegex(!regex)}>(.*)
            </button>
            <button {...stdTooltip("Чутливість до регістру")} className={classNames("btn-base", { enabled: caseSensitive })}
                    onClick={e => setCaseSensitive(!caseSensitive)}>aA
            </button>
            <button {...stdTooltip("Шукати по ID")} className={classNames("btn-base", { enabled: byId })}
                    onClick={e => setById(!byId)}>ID
            </button>
        </div>
    </div>
}
