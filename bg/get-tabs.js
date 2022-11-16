import {queryTabs} from "../util-ext-bg.js";

export function initGetTabsListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message === "get-tabs--message-exchange") {
            void asyncHandler(sendResponse);
        }
        return true;
    });
}

async function asyncHandler(sendResponse) {
    const tabs = await queryTabs({});
    sendResponse(tabs);
}
