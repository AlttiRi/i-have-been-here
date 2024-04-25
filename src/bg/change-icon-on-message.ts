import {getActiveTab}            from "../util-ext-bg.js";
import {emojiToImageData, sleep} from "../util.js";
import {updateIcons}  from "./tab-counter.js";
import {ChangeIconPS} from "../message-center.js";

export function changeIconOnMessage() {
    ChangeIconPS.addListener(blinkDownloadEmoji);
}

async function blinkDownloadEmoji(_data: undefined, sender: chrome.runtime.MessageSender) {
    const tab = await getActiveTab();
    if (!tab) {
        return;
    }
    const imageData = emojiToImageData("💾");
    chrome.browserAction.setIcon({
        imageData,
        tabId: tab.id
    });

    await sleep(500);
    updateIcons([tab]); // Restore icon
}
