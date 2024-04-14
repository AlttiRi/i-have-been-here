import {queryTabs} from "../util-ext-bg.js";
import {SendResponse} from "../util-ext.js";

export function initGetTabsListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message === "get-tabs--message-exchange") {
            void asyncHandler(sendResponse);
            return true;
        }
    });
}

async function asyncHandler(sendResponse: SendResponse) {
    const tabs = await queryTabs({});
    sendResponse(tabs);
}
