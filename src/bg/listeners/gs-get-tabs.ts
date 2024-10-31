import {queryTabs}   from "@/utils/util-ext";
import {TabsGetting} from "@/common/message-center";

export function initGS_GetTabs(): void {
    TabsGetting.addListener(function getTabsHandler(): Promise<chrome.tabs.Tab[]> {
        return queryTabs({});
    });
}
