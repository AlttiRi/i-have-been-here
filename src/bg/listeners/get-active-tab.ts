import {getActiveTab} from "@/utils/util-ext";
import {ActiveTabsGetting} from "@/common/message-center";
import {ActiveTabRequest}  from "@/common/types";
import {LastActiveTabsQueue} from "@/bg/classes/last-active-tabs-queue";
import {logOrange} from "@/utils/util";

export function initActiveTabsGetting() {
    ActiveTabsGetting.addListener(async function getActiveTabHandler(request: ActiveTabRequest | void) {
        const {
            currentWindow = true,
        } = (request || {});
        const res = await getActiveTab(currentWindow);
        if (res === undefined) {
            const tabs = await LastActiveTabsQueue.getLastActiveTabsForCurrentWindow();
            if (tabs && tabs.length) {
                logOrange("[fallback] Get active tab from LastActiveTabsQueue")();
                return tabs[tabs.length - 1];
            }
        }
        return res;
    });
}
