import "./LoadingOverlay.scss";

import {AnimatedEllipsis} from '../AnimatedEllipsis';

export function LoadingOverlay({ isLoading }) {
    return <div className={"LoadingOverlay" + (isLoading ? "" : " hidden")}>
        <AnimatedEllipsis />
    </div>
}
