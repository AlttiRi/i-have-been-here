import {executeScript} from "../util-ext-bg.js";
import {logPicture, downloadBlob, JpgDataURL, Base64} from "../util.js";
import {exchangeMessageWithTab, getFromStoreLocal, setToStoreLocal} from "../util-ext.js";
import {getScdId, toStoreData} from "./image-data.js";
import {getScreenshotFilename} from "../pages/popup-util.js";
import {DownloadScreenshotSS, LogScreenshotSS, SaveScreenshotES} from "../message-center.js";
import {ScreenshotInfo} from "../types.js";

export function logImageOnMessage(): void { // todo rename
    LogScreenshotSS.addListener(_logScreenshot);
    DownloadScreenshotSS.addListener(_downloadScreenshot);
    SaveScreenshotES.addListener(_saveScreenshot);
}


async function _saveScreenshot(tc: TabCapture): Promise<string> {
    console.log("_saveScreenshot", tc.tab.url, tc.screenshotUrl);
    const base64: Base64 = toStoreData(tc.screenshotUrl);
    const scd_id = await getScdId(base64);
    await setToStoreLocal(scd_id, base64);
    const sci: ScreenshotInfo = {
        title: tc.tab.title || "",
        url: tc.tab.url || "",
        created: tc.date,
        scd_id,
    };
    const screenshots: ScreenshotInfo[] = await getFromStoreLocal("screenshots") || [];
    screenshots.push(sci);
    await setToStoreLocal("screenshots", screenshots);

    return `[handler]: screenshot is stored (${scd_id})`;
}

export type TabCapture = {
    tab: chrome.tabs.Tab/* & {url: string}*/,
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
