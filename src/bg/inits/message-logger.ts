import {inIncognitoContext} from "@/utils/util-ext";
import {logOrange} from "@/utils/util";


export function initLogEverything(): void {
    chrome.runtime.onMessage.addListener(function logEverything(message: any, sender: chrome.runtime.MessageSender) {
        console.log(`[${inIncognitoContext ? "⬛" : "⬜"}][Incoming message]`, message, {from: sender});
    });

    // chrome.runtime.sendMessage("ljjoafkhpecgfpppmbkenhojmcilpmgp", `message from ${chrome.runtime.id}`);
    chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
        logOrange("[External message]", {request, sender, sendResponse})();
    });
}
