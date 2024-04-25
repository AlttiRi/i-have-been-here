import {getActiveTab}            from "../util-ext-bg.js";
import {inIncognitoContext}      from "../util-ext.js";
import {emojiToImageData, sleep} from "../util.js";
import {updateIcons}  from "./tab-counter.js";
import {ChangeIconPS} from "../message-center.js";

export function changeIconOnMessage() {
    ChangeIconPS.addListener(blinkDownloadEmoji);
}

async function blinkDownloadEmoji(data: undefined, sender: chrome.runtime.MessageSender) {
    console.log(sender);
    // id: "llbhojonnafjopkkokcjhomnceajcdmh"
    // origin: "chrome-extension://llbhojonnafjopkkokcjhomnceajcdmh"
    // url: "chrome-extension://llbhojonnafjopkkokcjhomnceajcdmh/popup.html"
    console.log(data);
    console.log(`Incognito: ${inIncognitoContext}.`);

    // const color = [88, 88, 88, 255];
    // const array = new Array(64 * 64 * 4).fill(color, 0, 64 * 64).flat();
    // const imageData = new ImageData(new Uint8ClampedArray(array), 64, 64);
    // or
    const imageData = emojiToImageData("💾");

    const tab = await getActiveTab();
    if (!tab) {
        return;
    }
    chrome.browserAction.setIcon({
        imageData,
        tabId: tab.id
    });

    await sleep(500);
    updateIcons([tab]); // Restore icon
}
