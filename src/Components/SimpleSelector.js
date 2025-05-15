import {useEffect, useMemo, useState} from 'react';
import Select from 'react-select';
import useWindowDimensions from '../common/useWindowDimensions';
import {constants} from '../common/constants';


function Empty() {
    return <span>Пусто</span>
}

export function SimpleSelector({values, targetValue, setTargetValue, cls, placeholder, clsNames, defaultIndex}) {
    let {width} = useWindowDimensions();
    let abridgeLen = width < constants.thresholdWidth ? 3 : 100;

    let options = useMemo(() => values.map(value => ({value: value, label: value.slice(0, abridgeLen)})) || [], [values, abridgeLen]);

    let [activeEntry, setActiveEntry] = useState(null);
    useEffect(() => {
        if (options.length > 0) {
            setActiveEntry(options.find(o => o.value === targetValue) || options[defaultIndex || 0] || options[0]);
        }
    }, [options, targetValue]);
    useEffect(() => {
        if (activeEntry) {
            setTargetValue(activeEntry.value);
        }
    }, [activeEntry, setTargetValue]);
    return <Select noOptionsMessage={Empty}
                   styles={commonSelectStyles}
                   placeholder={placeholder} classNames={clsNames} className={cls} options={options}
                   value={activeEntry} onChange={setActiveEntry}/>
}

export const commonSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: 'var(--color-bg)',
        color: 'var(--text-color)',
    }),
    singleValue: (provided, state) => ({
        ...provided,
        color: 'var(--text-color)',
    }),
    menu: (provided, state) => {
        let styles = ({
            ...provided,
            background: 'var(--color-bg)',
            color: 'var(--text-color)'
        });
        return styles;
    },
    option: (provided, state) => {
        let styles = { ...provided };
        if (state.isFocused && !state.isSelected) {
            styles.color = 'var(--color-focused-text)';
        }
        return styles;
    }
};
