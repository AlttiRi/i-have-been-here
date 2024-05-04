import {getActiveTab}            from "@/src/util-ext-bg";
import {emojiToImageData, sleep} from "@/src/util";
import {updateIcons}  from "@/src/bg/tab-counter";
import {ChangeIconPS} from "@/src/message-center";

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
