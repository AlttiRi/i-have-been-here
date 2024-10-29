import {sleep} from "@alttiri/util-js";
import {emojiToImageData}  from "@/util";
import {setIcon}           from "@/util-ext";
import {getActiveTab}      from "@/util-ext-bg";
import {ChangeIconPS}      from "@/message-center";
import {updateIconByTabId} from "@/bg/bg-init-badges-icons";

export function initPS_ChangeIcon() {
    ChangeIconPS.addListener(blinkDownloadEmoji);
}

async function blinkDownloadEmoji(_data: undefined, _sender: chrome.runtime.MessageSender) {
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
    void updateIconByTabId(tab.id); // Restore the icon
}
