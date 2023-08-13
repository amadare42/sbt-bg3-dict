import {useEffect, useMemo, useState} from 'react';
import Select from 'react-select';
import useWindowDimensions from '../../common/useWindowDimensions';
import {constants} from '../../common/constants';
import {commonSelectStyles} from '../SimpleSelector';

export function FileSelector({entries, activeEntry, setActiveEntry, targetLang}) {
    let {width} = useWindowDimensions();
    let abridgeLen = width < constants.thresholdWidth ? 12 + (targetLang?.length || 0) + 2 : 0;
    return <ObjectSelector placeholder={"Файл"} cls={'b'} values={entries} targetValue={activeEntry}
                           setTargetValue={setActiveEntry} labelField={'fileName'}
                           abridgeLen={abridgeLen}/>
}

function Empty() {
    return <span>Пусто</span>
}

function ObjectSelector({values, targetValue, setTargetValue, cls, placeholder, labelField, abridgeLen}) {
    let options = useMemo(() => values.map(value => ({
        value: value,
        label: abridgeLen > 0 ? value[labelField].slice(abridgeLen) : value[labelField]
    })) || [], [values, labelField, abridgeLen]);
    let [activeEntry, setActiveEntry] = useState(null);
    useEffect(() => {
        if (options.length > 0) {
            setActiveEntry(options.find(o => o.value === targetValue) || options[0]);
        }
    }, [options, targetValue]);
    useEffect(() => {
        if (activeEntry) {
            setTargetValue(activeEntry.value);
        }
    }, [activeEntry, setTargetValue]);
    return <Select noOptionsMessage={Empty}
                   styles={commonSelectStyles}
                   placeholder={placeholder} className={cls} options={options}
                   value={activeEntry} onChange={setActiveEntry}/>
}
