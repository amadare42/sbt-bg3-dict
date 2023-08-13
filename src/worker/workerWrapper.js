import {createCallingProxy} from './proxy';

const worker = new Worker(new URL('./worker.js', import.meta.url));

let override = localStorage.getItem("sourceUrlOverride");
const rootUrl = override || (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? '/data' : "https://sbt-bg3-loc-db.s3.eu-west-2.amazonaws.com");
worker.postMessage({ key: 'init', payload: { rootUrl } });
export const workerWrapper = createCallingProxy(worker);
