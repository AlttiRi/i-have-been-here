import {
    exchangeMessageWithTab,
    executeScript,
} from "../util-ext-bg.js";
import {logPicture, downloadBlob, JpgDataURL, TextURL} from "../util.js";
import {setToStoreLocal} from "../util-ext.js";
import {toStoreData} from "./image-data.js";
import {getScreenshotFilename} from "../pages/popup-util.js";
import {DownloadScreenshotSS, LogScreenshotSS, SaveScreenshotES} from "../message-center.js";

export function logImageOnMessage(): void { // todo rename
    LogScreenshotSS.addListener(_logScreenshot);
    DownloadScreenshotSS.addListener(_downloadScreenshot);
    SaveScreenshotES.addListener(_saveScreenshot);
}

export type ScreenshotSaveData = {
    dataUrl: JpgDataURL,
    tabUrl:  TextURL,
}
async function _saveScreenshot({dataUrl, tabUrl}: ScreenshotSaveData): Promise<string> {
    console.log(`setToStoreLocal ["save-screenshot"]`, tabUrl, dataUrl);
    await setToStoreLocal("screenshot:" + tabUrl, toStoreData(dataUrl));
    return "[handler]: screenshot is stored";
}

export type TabCapture = {
    tab: chrome.tabs.Tab,
    screenshotUrl: JpgDataURL,
    date: number,
};

async function _downloadScreenshot(tabCapture: TabCapture): Promise<void> {
    const resp = await fetch(tabCapture.screenshotUrl);
    const blob = await resp.blob();

    const {url = "", title = ""} = tabCapture.tab;
    const name = await getScreenshotFilename(url, title);
    downloadBlob(blob, name, url);
}

async function _logScreenshot(tabData: TabCapture): Promise<void> {
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
        command: "log-screenshot--message-exchange-tab",
        data: tabData.screenshotUrl
    });
    if (result === "[content script]: image logged") {
        console.log("Image was logged in the tab");
    }
}
