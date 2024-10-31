import {sleep} from "@alttiri/util-js";
import {PingPonging} from "@/common/message-center";

let _resolve: Function;
export const onBgReady = new Promise<void>(resolve => {
    _resolve = resolve;
});

/** It's required sometimes on the browser start when there are opened the extension' pages. */
;(async function awaitBg() { // todo: don't stop vue rendering, just delays the data loading
    console.log("Ping-Pong BG.");
    const title = document.title;
    while (!(await PingPonging.ping())) {
        document.title = "Loading...";
        console.log("Awaiting the background script loading end.");
        await sleep(10);
    }
    console.log("BG is ready.");
    document.title = title;
    _resolve!();
})();
