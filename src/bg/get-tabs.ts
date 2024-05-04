import {queryTabs} from "@/util-ext-bg";
import {GetTabsGS} from "@/message-center";

export function initGetTabsListener(): void {
    GetTabsGS.addListener(function getTabsHandler(): Promise<chrome.tabs.Tab[]> {
        return queryTabs({});
    });
}
