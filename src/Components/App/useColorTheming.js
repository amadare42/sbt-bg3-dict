import {useEffect, useMemo} from 'react';
import useLocalStorage from '../../common/useLocalStorage';

const applyTheme = theme => document.documentElement.className = theme;
export function useColorTheming() {
    const [theme, setTheme] = useLocalStorage("app.theme", getPreferredColorScheme());
    const toggleTheme = useMemo(() => () => {
        setTheme(theme === "light" ? "dark" : "light");
    }, [theme, setTheme]);
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);
    return { theme, setTheme, toggleTheme };
}

function getPreferredColorScheme() {
    if (window.matchMedia) {
        if(window.matchMedia('(prefers-color-scheme: dark)').matches){
            return 'dark';
        } else {
            return 'light';
        }
    }
    return 'light';
}
