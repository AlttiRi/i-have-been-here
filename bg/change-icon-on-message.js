import {emojiToImageData, inIncognitoContext, getActiveTabId} from "../util.js";

export function changeIconOnMessage(onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message !== onMessage) {
            return;
        }
        console.log(sender);
        // id: "gjcpkeofcjdjkhafgomjpcpoplngijlp"
        // origin: "chrome-extension://gjcpkeofcjdjkhafgomjpcpoplngijlp"
        // url: "chrome-extension://gjcpkeofcjdjkhafgomjpcpoplngijlp/popup.html"
        console.log(message);
        console.log(`Incognito: ${inIncognitoContext}.`);

        // const color = [88, 88, 88, 255];
        // const array = new Array(64 * 64 * 4).fill(color, 0, 64 * 64).flat();
        // const imageData = new ImageData(new Uint8ClampedArray(array), 64, 64);
        // or
        const imageData = emojiToImageData("🔄");

        // do not use await, Firefox does not work with async listeners
        getActiveTabId().then(tabId => {
            chrome.browserAction.setIcon({
                imageData,
                tabId
            });
        });
    });
}