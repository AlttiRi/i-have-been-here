import {getActiveTab} from "@/utils/util-ext";
import {ActiveTabsGetting} from "@/common/message-center";
import {ActiveTabRequest}  from "@/common/types";

export function initActiveTabsGetting() {
    ActiveTabsGetting.addListener(function getActiveTabHandler(request: ActiveTabRequest | void) {
        const {
            currentWindow = true,
        } = (request || {});
        return getActiveTab(currentWindow);
    });
}
