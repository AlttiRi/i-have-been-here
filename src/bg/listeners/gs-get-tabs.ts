import {queryTabs} from "@/utils/util-ext";
import {GetTabsGS} from "@/common/message-center";

export function initGS_GetTabs(): void {
    GetTabsGS.addListener(function getTabsHandler(): Promise<chrome.tabs.Tab[]> {
        return queryTabs({});
    });
}
