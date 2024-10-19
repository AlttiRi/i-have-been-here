import {inIncognitoContext} from "@/util-ext";


export function initLogEverything(): void {
    chrome.runtime.onMessage.addListener(function logEverything(message: any, sender: chrome.runtime.MessageSender) {
        console.log(`[${inIncognitoContext ? "⬛" : "⬜"}][Incoming message]`, message, {from: sender});
    });
}
