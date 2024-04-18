import {queryTabs} from "../util-ext-bg.js";
import {GetTabsGS} from "../message-center.js";

export function initGetTabsListener(): void {
    GetTabsGS.addListener(function getTabsHandler(): Promise<chrome.tabs.Tab[]> {
        return queryTabs({});
    });
}
