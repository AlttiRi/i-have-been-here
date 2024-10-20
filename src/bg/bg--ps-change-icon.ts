import {sleep} from "@alttiri/util-js";
import {emojiToImageData} from "@/util";
import {getActiveTab}     from "@/util-ext-bg";
import {ChangeIconPS}     from "@/message-center";
import {updateIcons}      from "@/bg/tab-counter";

export function initPS_ChangeIcon() {
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
