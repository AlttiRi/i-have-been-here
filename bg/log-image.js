import {
    captureVisibleTab,
    exchangeMessageWithTab,
    executeScript,
    getActiveTab,
} from "../util-ext-bg.js";
import {logPicture} from "../util.js";
import {setToStoreLocal} from "../util-ext.js";
import {toStoreData} from "./image-data.js";

export function logImageOnMessage() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message === "take-screenshot--message-exchange") {
            void asyncHandler(sendResponse);
        } else
        if (message?.command === "save-screenshot--message-exchange"){
            const {dataUrl, tabUrl} = message;
            console.log("setToStoreLocal [\"save-screenshot\"]", dataUrl);
            void setToStoreLocal("screenshot:" + tabUrl, toStoreData(dataUrl)).then(() => {
                console.log("stored");
                sendResponse(true);
            });
        }
        return true;
    });
}

export async function getActiveTabData() {
    const date = Date.now();
    const tab = await getActiveTab();
    if (!tab) {
        console.log("[warning] no active tab available");
        return {};
    }
    console.log("Active tab:", tab);
    const {url, title, favIconUrl, id, incognito, height, width} = tab;
    const screenshotUrl = await captureVisibleTab({quality: 92});
    return {id, url, title, favIconUrl, screenshotUrl, date, incognito, height, width};
}

async function asyncHandler(sendResponse) {
    const {date, screenshotUrl, url: tabUrl, title: tabTitle, id: tabId} = await getActiveTabData();

    sendResponse({tabUrl, tabTitle, screenshotUrl, date});
    if (!screenshotUrl) {
        return;
    }
    logPicture(screenshotUrl);

    const injected = await executeScript({
        file: "content-log-image.js",
    });
    if (!injected) {
        return;
    }

    // Log the image in the web page console (send the message to the injected content script)
    await exchangeMessageWithTab(tabId, {
        command: "log-screenshot--message-exchange",
        data: screenshotUrl
    });
}
