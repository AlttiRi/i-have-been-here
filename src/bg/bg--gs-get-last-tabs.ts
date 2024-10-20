import {GetLastTabsGS}       from "@/message-center";
import {LastActiveTabsQueue} from "@/bg/classes/bg-last-active-tabs-queue";

export function initGS_GetLastTabs() {
    GetLastTabsGS.addListener(async () => {
        const tabs = await LastActiveTabsQueue.getLastActiveTabsForCurrentWindow();
        return tabs || [];
    });
}
