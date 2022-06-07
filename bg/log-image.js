import {captureVisibleTab, executeScript, getActiveTab, sendMessageToTab} from "../util-ext-bg.js";
import {logPicture} from "../util.js";

export function logImageOnMessage(messageText) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message !== messageText) {
            return;
        }
        void asyncHandler(sendResponse);
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

    // Log the image in the web page console (send the message to the injected content script)
    await sendMessageToTab(tab.id, {
        text: "log-screenshot",
        url: screenshotUrl
    });
}
