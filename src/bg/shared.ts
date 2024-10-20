import {quickAccessUrl}        from "@/bg/store/store";
import {FocusOrCreateNewTabES} from "@/message-center";


export async function openQuickAccessUrl(): Promise<chrome.tabs.Tab | undefined> {
    const url = await quickAccessUrl.getValue();
    return FocusOrCreateNewTabES.exchange({url});
}
