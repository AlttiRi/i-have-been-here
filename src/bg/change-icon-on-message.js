import {getActiveTab} from "/src/util-ext-bg.js";
import {inIncognitoContext} from "/src/util-ext.js";
import {emojiToImageData, sleep} from "../util.js";
import {updateIcons} from "./tab-counter.js";

export function changeIconOnMessage() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message !== "change-icon--message") {
            return;
        }
        void handler(message, sender, sendResponse);
        return true;
    });
}

async function handler(message, sender, sendResponse) {
    console.log(sender);
    // id: "llbhojonnafjopkkokcjhomnceajcdmh"
    // origin: "chrome-extension://llbhojonnafjopkkokcjhomnceajcdmh"
    // url: "chrome-extension://llbhojonnafjopkkokcjhomnceajcdmh/popup.html"
    console.log(message);
    console.log(`Incognito: ${inIncognitoContext}.`);

    // const color = [88, 88, 88, 255];
    // const array = new Array(64 * 64 * 4).fill(color, 0, 64 * 64).flat();
    // const imageData = new ImageData(new Uint8ClampedArray(array), 64, 64);
    // or
    const imageData = emojiToImageData("💾");

    const tab = await getActiveTab();
    chrome.browserAction.setIcon({
        imageData,
        tabId: tab.id
    });

    await sleep(500);
    updateIcons([tab]); // Restore icon
}
