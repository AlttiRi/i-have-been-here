import {PngDataURL} from "./util.js";

export function queryTabs(queryInfo?: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    return new Promise(resolve => chrome.tabs.query(queryInfo || {}, resolve));
}

export async function getPopup(details?: chrome.browserAction.TabDetails): Promise<string> {
    if (details === undefined) {
        return getPopup({tabId: await getActiveTabId()});
    }
    return new Promise(resolve => chrome.browserAction.getPopup(details, resolve));
}

export async function getTitle(details?: chrome.browserAction.TabDetails): Promise<string> {
    if (details === undefined) {
        return getTitle({tabId: await getActiveTabId()});
    }
    return new Promise(resolve => chrome.browserAction.getTitle(details, resolve));
}

// todo move to util-ext.js
/**
 * Send a message from the background script to a tab's content script and get the response back.
 * @see {import("src/util-ext.js").SendResponse}
 * @see {import("src/util-ext.js").exchangeMessage}
 */
export function exchangeMessageWithTab(tabId: number, message: any): Promise<any> {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, function responseCallback(response) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            console.log(`[exchangeMessageWithTab] Tab's (${tabId}) response:`, response);
            resolve(response);
        });
    });
}

export const allowedProtocols = ["http:", "https:", "file:", "ftp:"];

export async function executeScript(details: chrome.tabs.InjectDetails): Promise<boolean> {
    const activeTab = await getActiveTab();

    if (!activeTab) {
        console.warn("[warning][executeScript] No active tab for injection.");
        return false;
    }
    if (!activeTab.url) {
        console.warn("[warning][executeScript] No active tab's url");
        return false;
    }

    if (!allowedProtocols.includes(new URL(activeTab.url).protocol)) {
        console.warn("[warning][executeScript] Not allowed protocol for injection.", activeTab.url, activeTab);
        return false;
    }

    const scriptResults = await new Promise(resolve => {
        chrome.tabs.executeScript(details, result => {
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

export async function captureVisibleTab(options: chrome.tabs.CaptureVisibleTabOptions = {}): Promise<PngDataURL | null> {
    options = {...{format: "jpeg", quality: 92}, ...options};
    const activeTab = await getActiveTab();
    if (!activeTab) {
        console.warn("[warning][captureVisibleTab] No tab for capture.");
        return null;
    }
    return new Promise(resolve => {
        chrome.tabs.captureVisibleTab(options, (screenshotDataUrl: string) => {
            resolve(screenshotDataUrl as PngDataURL);
        });
    });
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

class LastActiveTabsQueue {
    static instance = new LastActiveTabsQueue();
    private windowIdsToTabs: Map<number, chrome.tabs.Tab[]>;

    /** @private */
    constructor() {
        this.windowIdsToTabs = new Map();
        void this.init();
    }

    async init() {
        const self = this;

        const windows: chrome.windows.Window[] = await new Promise(resolve => chrome.windows.getAll(resolve));
        for (const window of windows) {
            const tabs: chrome.tabs.Tab[] = await new Promise(resolve => {
                chrome.tabs.query({windowId: window.id}, resolve);
            });
            if (window.id === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init] window.id === undefined");
                continue;
            }
            self.windowIdsToTabs.set(window.id, tabs);
        }

        chrome.tabs.onActivated.addListener(({tabId, windowId}) => {
            // console.log("onActivated", tabId, windowId);
            const tabs = self.windowIdsToTabs.get(windowId);
            if (tabs === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init][onActivated] tabs === undefined");
                return;
            }
            const tab = tabs.find(tab => tab.id === tabId);
            if (tab === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init][onActivated] tab === undefined");
                return;
            }
            tabs.splice(tabs.indexOf(tab), 1);
            tabs.push(tab);
            // console.log(self.windowIdsToTabs);
        });

        chrome.tabs.onCreated.addListener(tab => {
            // console.log("onCreated", tab);
            if (!self.windowIdsToTabs.has(tab.windowId)) {
                self.windowIdsToTabs.set(tab.windowId, []);
            }
            const tabs = self.windowIdsToTabs.get(tab.windowId);
            if (tabs === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init][onCreated] tabs === undefined");
                return;
            }
            tabs.push(tab);
        });

        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            // console.log("onRemoved", tabId, removeInfo);
            const tabs = self.windowIdsToTabs.get(removeInfo.windowId);
            if (tabs === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init][onRemoved] tabs === undefined");
                return;
            }
            const tab = tabs.find(tab => tab.id === tabId);
            if (tab === undefined) {
                console.warn("[warning][LastActiveTabsQueue.init][onRemoved] tab === undefined");
                return;
            }
            tabs.splice(tabs.indexOf(tab), 1);
            if (!tabs.length) {
                self.windowIdsToTabs.delete(removeInfo.windowId);
            }
        });
    }

    static async getLastActiveTabByUrl(url: string): Promise<chrome.tabs.Tab | null> { // for active window
        const self = LastActiveTabsQueue.instance;
        const window: chrome.windows.Window = await new Promise(resolve => chrome.windows.getCurrent(resolve));
        if (window.id === undefined) {
            console.warn("[warning][getLastActiveTabByUrl] window.id === undefined");
            return null;
        }
        const tabs = self.windowIdsToTabs.get(window.id);
        if (tabs === undefined) {
            console.warn("[warning][getLastActiveTabByUrl] tabs === undefined");
            return null;
        }
        const expectedTabs = tabs.filter(tab => tab.url === url || tab.pendingUrl === url);
        if (expectedTabs.length === 0) {
            console.warn("[warning][getLastActiveTabByUrl] expectedTabs.length === 0");
            return null;
        }
        return expectedTabs[expectedTabs.length - 1];
    }
}

export async function focusOrCreateNewTab(url: string, reload = false): Promise<chrome.tabs.Tab | undefined> {
    console.log("focusOrCreateNewTab");
    const lastSelectedTab = await LastActiveTabsQueue.getLastActiveTabByUrl(url);
    return new Promise(resolve => {
        if (lastSelectedTab && lastSelectedTab.id) {
            chrome.tabs.update(lastSelectedTab.id, {
                active: true,
                url: reload ? url : undefined
            }, resolve);
        } else {
            chrome.tabs.create({url}, resolve);
        }
    });
}
// The simple implementation
async function focusOrCreateNewTabSimple(url: string, reload = false) {
    const tabs = await queryTabs({url, currentWindow: true});
    const activeTabId  = tabs.find(tab => tab.active)?.id;
    const lastTabId  = tabs[tabs.length - 1]?.id;
    const firstTabId = tabs[0]?.id;
    const tabId = activeTabId || lastTabId;

    if (tabId) {
        chrome.tabs.update(tabId, {
            active: true,
            url: reload ? url : undefined
        });
    } else {
        chrome.tabs.create({url});
    }
}
