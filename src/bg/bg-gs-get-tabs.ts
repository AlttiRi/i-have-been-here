import {queryTabs} from "@/util-ext-bg";
import {GetTabsGS} from "@/message-center";

export function initGS_GetTabs(): void {
    GetTabsGS.addListener(function getTabsHandler(): Promise<chrome.tabs.Tab[]> {
        return queryTabs({});
    });
}
