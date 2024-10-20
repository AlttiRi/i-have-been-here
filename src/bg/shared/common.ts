import {FocusOrCreateNewTabES} from "@/message-center";
import {quickAccessUrl}        from "@/bg/shared/store";


export async function openQuickAccessUrl(): Promise<chrome.tabs.Tab | undefined> {
    const url = await quickAccessUrl.getValue();
    return FocusOrCreateNewTabES.exchange({url});
}
