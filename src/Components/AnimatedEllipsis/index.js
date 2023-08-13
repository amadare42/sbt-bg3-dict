import './spinner.css';
import React from 'react';

export function AnimatedEllipsis() {
    return <span className={"ellipsis-container"}>
        <span className={'ellipsis-dot'}></span>
        <span className={'ellipsis-dot'}></span>
        <span className={'ellipsis-dot'}></span>
    </span>
}
