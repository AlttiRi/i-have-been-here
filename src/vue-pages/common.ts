import {sleep} from "@alttiri/util-js";
import {PingPonging, TabsGetting} from "@/common/message-center";

let isReady = false;
let resolve: Function;
export const onBgReady = new Promise<void>(_resolve => {
    resolve = _resolve;
});

/** It's required sometimes on the browser start when there are opened the extension' pages. */
;(async function awaitBg() {
    console.log("Ping-Pong BG.");
    const title = document.title;
    while (!(await PingPonging.ping())) {
        document.title = "Loading...";
        console.log("Awaiting the background script loading end.");
        await sleep(10);
    }
    console.log("BG is ready.");
    document.title = title;
    isReady = true;
    resolve!();
})();


type GetTabsArgs = Parameters<typeof TabsGetting.get>;
type GetTabsRets = ReturnType<typeof TabsGetting.get>;
export async function getTabs(...args: GetTabsArgs): GetTabsRets {
    if (!isReady) {
        await onBgReady;
    }
    return TabsGetting.get(...args);
}

