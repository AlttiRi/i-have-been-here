import {sleep} from "@alttiri/util-js";
import {JpgDataURL} from "@/util";


export function queryTabs(queryInfo?: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    return new Promise(resolve => chrome.tabs.query(queryInfo || {}, resolve));
}

export function getTab(tabId: number): Promise<chrome.tabs.Tab> {
    return new Promise(resolve => chrome.tabs.get(tabId, resolve));
}

/** Gets the html document set as the popup for this browser action. */
export async function getPopup(details?: chrome.browserAction.TabDetails): Promise<string> {
    if (details === undefined) {
        return getPopup({tabId: await getActiveTabId()});
    }
    return new Promise(resolve => chrome.browserAction.getPopup(details, resolve));
}

/** Gets the title of the browser action. */
export async function getTitle(details?: chrome.browserAction.TabDetails): Promise<string> {
    if (details === undefined) {
        return getTitle({tabId: await getActiveTabId()});
    }
    return new Promise(resolve => chrome.browserAction.getTitle(details, resolve));
}


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
        console.warn("[warning][executeScript] Not allowed protocol for injection.", tabUrl, tab);
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

export async function getActiveTabId(currentWindow: boolean = true) {
    return (await getActiveTab(currentWindow))?.id;
}

/** Returns `null` when the last focused window is DevTools */
export async function getActiveTab(currentWindow: boolean = true): Promise<chrome.tabs.Tab | undefined> {
    const tabs: chrome.tabs.Tab[] = await queryTabs({
        active: true,
        currentWindow
    });
    if (tabs.length === 0) {
        console.warn("[warning][getActiveTab] tabs.length === 0");
        return;
    }
    return tabs[0];
}

export function createBackgroundTab(url: string): void {
    chrome.tabs.create({
        url,
        active: false
    });
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

export function openOptions(old = true) {
    if (old) {
        chrome.tabs.create({
            url: "chrome://extensions/?options=" + chrome.runtime.id
        });
    } else {
        chrome.runtime.openOptionsPage();
    }
}
