import {FocusOrCreateNewTabES} from "@/common/message-center";
import {quickAccessUrl}        from "@/common/reactive-store";


export async function openQuickAccessUrl(): Promise<chrome.tabs.Tab | undefined> {
    const url = await quickAccessUrl.getValue();
    return FocusOrCreateNewTabES.exchange({url});
}
