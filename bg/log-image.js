import {captureVisibleTab, executeScript, getActiveTab, getActiveTabId, logPicture} from "../util.js";

export function logImageOnMessage(messageText) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message !== messageText) {
            return;
        }
        asyncHandler(sendResponse).then(/*nothing*/);
        return true;
    });
}

async function asyncHandler(sendResponse) {
    const tab = await getActiveTab();

    if (!tab) {
        console.log("[warning] no active tab available");
        sendResponse({screenshotUrl: null});
        return;
    }

    const screenshotUrl = await captureVisibleTab();
    sendResponse({screenshotUrl});

    logPicture(screenshotUrl);
    await executeScript({
        file: "content-log-image.js",
    });

    chrome.tabs.sendMessage(tab.id,
        {
            text: "log-screenshot",
            url: screenshotUrl
        });
}