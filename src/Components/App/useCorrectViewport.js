import {useEffect} from 'react';

export function useCorrectViewport() {
    useEffect(() => {
        function sub() {
            var viewport = document.querySelector("meta[name=viewport]");
            viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);
        }

        window.addEventListener("load", sub);

        return () => {
            window.removeEventListener("load", sub);
        }
    })
}
