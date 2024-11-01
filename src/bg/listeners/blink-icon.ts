import {sleep} from "@alttiri/util-js";
import {emojiToImageData}      from "@/utils/util";
import {getActiveTab, setIcon} from "@/utils/util-ext";
import {IconBlinking}      from "@/common/message-center";
import {updateIconBy}      from "@/bg/inits/badges-icons";

export function initIconBlinking() {
    IconBlinking.addListener(blinkDownloadEmoji);
}

async function blinkDownloadEmoji(_data: void, _sender: chrome.runtime.MessageSender) {
    const tab = await getActiveTab();
    if (!tab || !tab.id) {
        return;
    }
    const imageData = emojiToImageData("💾");
    await setIcon({
        imageData,
        tabId: tab.id
    });

    await sleep(500);
    void updateIconBy({tabId: tab.id}); // Restore the icon
}
