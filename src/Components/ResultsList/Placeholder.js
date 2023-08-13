import {SearchIcon} from '../../common/icons';

export function ResultsPlaceholder({isVisible}) {
    if (!isVisible) {
        return null;
    }
    return <div className="ResultsListPlaceholder">
        <div className="ResultsListPlaceholder-text">
            <div className="ResultsListPlaceholder-body">
                Введіть пошуковий запит в поле пошуку та натисніть кнопку пошуку
            </div>
        </div>
        <div className="ResultsListPlaceholder-icon">
            <SearchIcon />
        </div>
    </div>
}
