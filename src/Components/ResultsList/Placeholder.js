import {NoResultIcon, SearchIcon} from '../../common/icons';

export function ResultsPlaceholder({ isVisible, searchRequested }) {
    if (!isVisible) {
        return null;
    }

    return <div className="ResultsListPlaceholder">
        <div className="ResultsListPlaceholder-text">
            <div className="ResultsListPlaceholder-body">
                { !searchRequested ? "Введіть пошуковий запит в поле пошуку та натисніть кнопку пошуку" : "Нічого не знайдено" }
            </div>
        </div>
        <div className="ResultsListPlaceholder-icon">
            { !searchRequested ? <SearchIcon /> : <NoResultIcon /> }
        </div>
    </div>
}
