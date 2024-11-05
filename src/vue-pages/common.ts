import {sleep} from "@alttiri/util-js";
import {PingPonging, TabsGetting} from "@/common/message-center";
import {ExchangeService}          from "@/common/classes/messages";


let isReady = false;
let resolve: Function;
export const onBgReady = new Promise<void>(_resolve => {
    resolve = _resolve;
});

/** It's required sometimes on the browser start when there are opened the extension' pages. */
;(async function awaitBg() {
    console.log("Ping-Pong BG.");
    const title = document.title;
    let pong = await PingPonging.ping();
    while (!pong) {
        document.title = "Loading...";
        console.log("Awaiting the background script loading.");
        await sleep(10);
        pong = await PingPonging.ping();
    }
    console.log("BG is ready.");
    if (document.title === "Loading...") {
        sleep(150).then(() => { /* Vivaldi fix */
            document.title = title;
        });
    }
    isReady = true;
    resolve!();
})();

function proxifyExchangeChannel<D, R>(eXs: ExchangeService<D, R>) {
    return new Proxy(eXs.send, {
        async apply(target: typeof eXs.send, _thisArg: any, args: Parameters<typeof eXs.send>): ReturnType<typeof eXs.send> {
            if (!isReady) {
                await onBgReady;
            }
            return Reflect.apply(target, eXs, args);
        }
    });
}

export const getTabs = proxifyExchangeChannel(TabsGetting);
