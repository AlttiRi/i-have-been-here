import {
    captureVisibleTab,
    exchangeMessageWithTab,
    executeScript,
    getActiveTab,
} from "../util-ext-bg.js";
import {logPicture} from "../util.js";
import {setToStoreLocal} from "../util-ext.js";

export function logImageOnMessage() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message === "take-screenshot--message-exchange") {
            void asyncHandler(sendResponse);
        } else
        if (message?.command === "save-screenshot--message-exchange"){
            const {dataUrl, tabUrl} = message;
            console.log("setToStoreLocal [\"save-screenshot\"]", dataUrl);
            void setToStoreLocal("screenshot:" + tabUrl, atob(dataUrl.substring("data:image/jpeg;base64,".length))).then(() => {
                console.log("stored");
                sendResponse(true);
            });
        }
        return true;
    });
}

async function asyncHandler(sendResponse) {
    const tab = await getActiveTab();
    const tabUrl = tab?.url;

    if (!tab) {
        console.log("[warning] no active tab available");
        sendResponse({screenshotUrl: null, tabUrl});
        return;
    }

    const screenshotUrl = await captureVisibleTab({quality: 92});
    sendResponse({screenshotUrl, tabUrl});

    logPicture(screenshotUrl);
    await executeScript({
        file: "content-log-image.js",
    });

    // Log the image in the web page console (send the message to the injected content script)
    await exchangeMessageWithTab(tab.id, {
        command: "log-screenshot--message-exchange",
        data: screenshotUrl
    });
}
