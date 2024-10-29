import {sleep} from "@alttiri/util-js";
import {JpgDataURL, logOrange} from "@/utils/util";
import {getActiveTab}          from "@/utils/util-ext";



export const allowedProtocols = ["http:", "https:", "file:", "ftp:"];

export async function executeScript(details: chrome.tabs.InjectDetails, tab?: chrome.tabs.Tab): Promise<boolean> {
    tab = tab ? tab : await getActiveTab();

    if (!tab) {
        console.warn("[warning][executeScript] No tab for injection.");
        return false;
    }

    const {id: tabId, url: tabUrl} = tab;
    if (!tabId) {
        console.warn("[warning][executeScript] No tab's id");
        return false;
    }
    if (!tabUrl) {
        console.warn("[warning][executeScript] No tab's url");
        return false;
    }

    if (!allowedProtocols.includes(new URL(tabUrl).protocol)) {
        logOrange("[warning][executeScript] Not allowed protocol for injection.", tabUrl, tab)();
        return false;
    }

    const scriptResults = await new Promise(resolve => {
        chrome.tabs.executeScript(tabId, details, result => {
            resolve(result);
        });
    });
    // console.log("[executeScript]", scriptResults); // [null]

    return true;
}

/** {format: "jpeg", quality: 92} by default */
export async function captureVisibleTab(
    options: chrome.tabs.CaptureVisibleTabOptions = {},
    waitTime: number = 550
): Promise<JpgDataURL | null> {
    options = {...{format: "jpeg", quality: 92}, ...options};
    const activeTab = await getActiveTab();
    if (!activeTab) {
        console.warn("[warning][captureVisibleTab] No tab for capture.");
        return null;
    }
    const promise: Promise<JpgDataURL | null> = new Promise(resolve => {
        chrome.tabs.captureVisibleTab(options, (screenshotDataUrl: string) => {
            if (!screenshotDataUrl) { // MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND
                console.warn("[warning][captureVisibleTab]", chrome.runtime.lastError?.message);
                resolve(null);
                return;
            }
            resolve(screenshotDataUrl as JpgDataURL);
        });
    });
    let ok = false;
    function noResponse(): null { // vivaldi's start page fix
        if (!ok) {
            console.warn(`[warning][captureVisibleTab] No response for ${waitTime} ms`);
        }
        return null;
    }
    return Promise.any([
        promise.then(data => (ok = true, data)),
        sleep(waitTime).then(noResponse), // todo abort
    ]);
}
