import {TabCreatingOrFocusing} from "@/common/message-center";
import {quickAccessUrl}        from "@/common/reactive-store";


export async function openQuickAccessUrl(): Promise<chrome.tabs.Tab | void> {
    const url = await quickAccessUrl.getValue();
    return TabCreatingOrFocusing.send({url});
}
