import {LastTabsGetting}     from "@/common/message-center";
import {LastActiveTabsQueue} from "@/bg/classes/last-active-tabs-queue";

export function initLastTabsGetting() {
    Object.assign(globalThis, {LastActiveTabsQueue});
    LastTabsGetting.addListener(async () => {
        const tabs = await LastActiveTabsQueue.getLastActiveTabsForCurrentWindow();
        return tabs || [];
    });
}
