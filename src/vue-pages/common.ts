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
    if (document.title === "Loading...") {
        document.title = title;
    }
    isReady = true;
    resolve!();
})();


type GetTabsArgs = Parameters<typeof TabsGetting.send>;
type GetTabsRets = ReturnType<typeof TabsGetting.send>;
export const getTabs = new Proxy(TabsGetting.send, {
    async apply(target: typeof TabsGetting.send, _thisArg: any, args: GetTabsArgs): GetTabsRets {
        if (!isReady) {
            await onBgReady;
        }
        return Reflect.apply(target, TabsGetting, args);
    }
});
