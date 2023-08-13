import './StatusBar.scss';

import {useMemo} from 'react';
import {AnimatedEllipsis} from '../AnimatedEllipsis';
import {ThemeIcon} from '../../common/icons';
import {stdTooltip} from '../../common/stdTooltip';

export function StatusBar({state, meta, toggleTheme}) {
    const dateString = useMemo(() => {
        if (!meta?.date) {
            return '';
        }
        let date = new Date(meta.date);
        return date.toLocaleDateString();
    }, [meta]);

    return <div className="StatusBar StatusBar-wrapper">
        <div className="application-block StatusBar-status">
            <p>Стан: <b>{mapStateName(state, meta)}</b></p>
            {dateString ? <p>Дані від: <b>{dateString}</b></p> : <p><AnimatedEllipsis/></p>}
        </div>
        <div className="application-block StatusBar-theme">
            <button className={"btn-base btn-theme"} onClick={toggleTheme} {...stdTooltip("Переключити кольорову схему")}>
                <ThemeIcon width={24} height={24} />
            </button>
        </div>
    </div>
}

let stateNames = {
    Initial: "Початковий",
    "Fetching data": "Отримання даних",
    "Decompressing": "Розпакування даних",
    "Decoding": "Декодування даних",
    "Parsing": "Обробка даних",
    "Checking for updates": "Перевірка оновлень",
    "Ready": "Готовий",
    "Error": "Помилка",
    "Fetching cached data": "Отримання збережених даних"
}

function mapStateName(stateName, meta) {
    if (stateName === "Error" && meta?.languages?.length ) {
        return "Помилка. Дані можуть бути застарілими."
    }
    return stateNames[stateName] || stateName;
}
