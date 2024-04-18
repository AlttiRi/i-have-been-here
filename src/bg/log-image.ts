import {
    exchangeMessageWithTab,
    executeScript,
} from "../util-ext-bg.js";
import {logPicture, downloadBlob, JpgDataURL} from "../util.js";
import {SendResponse, setToStoreLocal} from "../util-ext.js";
import {toStoreData} from "./image-data.js";
import {getScreenshotFilename} from "../pages/popup-util.js";

export function logImageOnMessage(): void { // todo rename
    function screenshotCommandHandler(message: any, _sender: chrome.runtime.MessageSender, sendResponse: SendResponse) {
        if (message?.command === "log-screenshot--message-exchange") { // todo just use `chrome.runtime.sendMessage`
            void logScreenshot(message.data);
            sendResponse(); // Required, since "-exchange",
            // return true; // No need, since `sendResponse` is sync (with no meaningful response payload)
        } else
        if (message?.command === "save-screenshot--message-exchange"){
            const {dataUrl, tabUrl} = message;
            void saveScreenshot({dataUrl, tabUrl}).then(() => {
                sendResponse("[handler]: screenshot is stored");
            });
            return true; // since `sendResponse` call is async
        } else if (message?.command === "download-screenshot--message") {
            void downloadScreenshot(message.data);
        }
    }
    chrome.runtime.onMessage.addListener(screenshotCommandHandler);
}

async function saveScreenshot({dataUrl, tabUrl}: {dataUrl: JpgDataURL, tabUrl: string}): Promise<void> {
    console.log(`setToStoreLocal ["save-screenshot"]`, tabUrl, dataUrl);
    void setToStoreLocal("screenshot:" + tabUrl, toStoreData(dataUrl));
}

export type TabCapture = {
    tab: chrome.tabs.Tab,
    screenshotUrl: JpgDataURL,
    date: number,
};

async function downloadScreenshot(tabCapture: TabCapture): Promise<void> {
    const resp = await fetch(tabCapture.screenshotUrl);
    const blob = await resp.blob();

    const {url = "", title = ""} = tabCapture.tab;
    const name = await getScreenshotFilename(url, title);
    downloadBlob(blob, name, url);
}

async function logScreenshot(tabData: TabCapture) {
    const {tab, screenshotUrl} = tabData;

    // Log the picture in a background script //
    logPicture(screenshotUrl);

    // Log the picture in a tab //
    if (!tab.id) {
        return;
    }
    const details: chrome.tabs.InjectDetails = {
        file: "/src/content/content--log-image.js",
    };
    const injected: boolean = await executeScript(details, tab);
    if (!injected) {
        return;
    }
    // Log the image in the web page console (send the message to the injected content script)
    const result = await exchangeMessageWithTab(tab.id, {
        command: "log-screenshot--message-exchange",
        data: tabData.screenshotUrl
    });
    if (result === "[content script]: image logged") {
        console.log("Image was logged in the tab");
    }
}
