import {downloadBlob}  from "@alttiri/util-js";
import {logPicture, JpgDataURL, Base64} from "@/util";
import {
    exchangeMessageWithTab,
    getFromStoreLocal,
    setToStoreLocal,
} from "@/util-ext";
import {executeScript}         from "@/util-ext-bg";
import {getScdId, toStoreData} from "@/bg/util-image-data";
import {getScreenshotFilename} from "@/util-ext-pages";
import {DownloadScreenshotSS, LogScreenshotSS, SaveScreenshotES} from "@/message-center";
import {ScreenshotInfo} from "@/types";
import {PagePaths} from "@/page-paths";


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
    const hash = await hashBlob(blob);
    const nameWithHash = name.replace(/\.jpg$/, ` - ${hash.slice(0, 8)}.jpg`);
    downloadBlob(blob, nameWithHash, url);
}

async function hashBlob(blob: Blob): Promise<string> {
    try {
        const hash = await crypto.subtle.digest("SHA-1", await blob.arrayBuffer());
        return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, "0")).join("");
    } catch (e) {
        console.error(e);
        return "";
    }
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
        file: PagePaths.content_log_image,
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
