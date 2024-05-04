import {queryTabs} from "@/src/util-ext-bg";
import {GetTabsGS} from "@/src/message-center";

export function initGetTabsListener(): void {
    GetTabsGS.addListener(function getTabsHandler(): Promise<chrome.tabs.Tab[]> {
        return queryTabs({});
    });
}
