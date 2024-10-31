import {downloadBlob}  from "@alttiri/util-js";
import {logPicture, hashBlob}   from "@/utils/util";
import {exchangeMessageWithTab} from "@/utils/util-ext";
import {executeScript}          from "@/utils/util-ext-extra";
import {getScreenshotFilename}  from "@/common/titles";
import {ScreenshotDownloading, ScreenshotLogging, ScreenshotSaving} from "@/common/message-center";
import {addScreenshot}  from "@/common/data/screenshots";
import {TabCapture, TabCaptureResponse} from "@/common/types";
import {PagePaths}      from "@/common/page-paths";
import {commonSettings} from "@/common/reactive-store";


/** Init `Screenshot` message handlers */
export function initMH_Screenshot(): void {
    ScreenshotDownloading.addListener(downloadScreenshot);
    ScreenshotSaving.addListener(saveScreenshot);
    ScreenshotLogging.addListener(logScreenshot);
}


async function downloadScreenshot(tc: TabCapture): Promise<void> {
    const resp = await fetch(tc.screenshotUrl);
    const blob = await resp.blob();

    const {url = "", title = ""} = tc.tab;
    const name = await getScreenshotFilename(url, title);
    const hash = await hashBlob(blob);
    const nameWithHash = name.replace(/\.jpg$/, ` - ${hash.slice(0, 8)}.jpg`);
    downloadBlob(blob, nameWithHash, url);
}

async function saveScreenshot(tc: TabCapture): Promise<TabCaptureResponse> {
    const sci = await addScreenshot(tc);
    return {scd_id: sci.scd_id};
}

// todo: make it optional in settings
async function logScreenshot(tc: TabCapture): Promise<void> {
    const {tab, screenshotUrl} = tc;

    // Log the picture in a background script //
    void logPicture(screenshotUrl);

    // Log the picture in a tab //
    if (!commonSettings.value.contentLogScreenshot) {
        return;
    }
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
        data: screenshotUrl
    });
    if (result === "[content script]: image logged") {
        console.log("Image was logged in the tab");
    }
}
