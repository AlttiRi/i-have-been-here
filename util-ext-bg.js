/**
 * @see chrome.tabs.query
 * @param {chrome.tabs.QueryInfo?} queryInfo
 * @return {Promise<chrome.tabs.Tab[]>}
 */
export const queryTabs = (queryInfo= {}) => {
    return new Promise(resolve => chrome.tabs.query(queryInfo, resolve));
}

/**
 * @param {chrome.browserAction.TabDetails?} details
 * @return {Promise<string>}
 */
export const getPopup = async function(details) {
    if (details === undefined || details === null) {
        return getPopup({tabId: await getActiveTabId()});
    }
    return new Promise(resolve => chrome.browserAction.getPopup(details, resolve));
}
/**
 * @param {chrome.browserAction.TabDetails?} details
 * @return {Promise<string>}
 */
export const getTitle = async function(details) {
    if (details === undefined || details === null) {
        return getTitle({tabId: await getActiveTabId()});
    }
    return new Promise(resolve => chrome.browserAction.getTitle(details, resolve));
}

// Requires to use `return true;`, or `sendResponse();` (since `responseCallback` is used in `chrome.tabs.sendMessage`)
// in `chrome.runtime.onMessage.addListener` callback.
// To prevent `The message port closed before a response was received.` error.
export function sendMessageToTab(tabId, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve(response);
        });
    });
}

export const allowedProtocols = ["http:", "https:", "file:", "ftp:"];

/**
 * @param {chrome.tabs.InjectDetails} details
 * @return {Promise<any[]|*>}
 */
export const executeScript = async function(details) {
    const activeTab = await getActiveTab();

    if (!activeTab) {
        console.log("[warning] No active tab for injection.");
        return;
    }

    if (!allowedProtocols.includes(new URL(activeTab.url).protocol)) {
        console.log("[warning] Not allowed protocol for injection.", activeTab.url);
        return;
    }

    return new Promise(resolve => {
        chrome.tabs.executeScript(details, result => {
            resolve(result);
        });
    });
}

export async function getActiveTabId(currentWindow) {
    return (await getActiveTab(currentWindow))?.id;
}

/**
 * @return {Promise<chrome.tabs.Tab>}
 */
export const getActiveTab = async function(currentWindow = true) {
    const tabs = await queryTabs({
        active: true,
        currentWindow
    });
    return tabs[0];
}

export function createBackgroundTab(url) {
    chrome.tabs.create({
        url,
        active: false
    });
}

export async function captureVisibleTab() {
    const activeTab = await getActiveTab();
    if (!activeTab) {
        console.log("[warning] No tab for capture.");
        return null;
    }
    return new Promise(resolve => {
        chrome.tabs.captureVisibleTab(screenshotDataUrl => {
            resolve(screenshotDataUrl);
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

    /** @private */
    constructor() {
        /** @type {Map<number, chrome.tabs.Tab[]>} */
        this.windowIdsToTabs = new Map();
        this.init().then(/*Nothing*/);
    }

    async init() {
        const self = this;

        chrome.windows.getAll(windows => {
            windows.forEach(window => {
                chrome.tabs.query({windowId: window.id}, tabs => {
                    self.windowIdsToTabs.set(window.id, tabs);
                });
            });
        });

        chrome.tabs.onActivated.addListener(({tabId, windowId}) => {
            //console.log("onActivated", tabId, windowId);
            const tabs = self.windowIdsToTabs.get(windowId);
            const tab = tabs.find(tab => tab.id === tabId);
            tabs.splice(tabs.indexOf(tab), 1);
            tabs.push(tab);

            //console.log(self.windowIdsToTabs);
        });

        chrome.tabs.onCreated.addListener(tab => {
            //console.log("onCreated", tab);
            if (!self.windowIdsToTabs.has(tab.windowId)) {
                self.windowIdsToTabs.set(tab.windowId, []);
            }
            const tabs = self.windowIdsToTabs.get(tab.windowId);
            tabs.push(tab);
        });

        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            //console.log("onRemoved", tabId, removeInfo);
            const tabs = self.windowIdsToTabs.get(removeInfo.windowId);
            const tab = tabs.find(tab => tab.id === tabId);
            tabs.splice(tabs.indexOf(tab), 1);
            if (!tabs.length) {
                self.windowIdsToTabs.delete(removeInfo.windowId);
            }
        });
    }

    static getLastActiveTabByUrl(url) { // for active window
        const self = LastActiveTabsQueue.instance;
        return new Promise(resolve => {
            chrome.windows.getCurrent(window => {
                const tabs = self.windowIdsToTabs.get(window.id);
                const expectedTabs = tabs.filter(tab => tab.url === url || tab.pendingUrl === url);
                resolve(expectedTabs[expectedTabs.length - 1]);
            });
        });
    }
}

export async function focusOrCreateNewTab(url, reload = false) {
    const lastSelectedTab = await LastActiveTabsQueue.getLastActiveTabByUrl(url);
    if (lastSelectedTab) {
        chrome.tabs.update(lastSelectedTab.id, {
            active: true,
            url: reload ? url : null
        });
    } else {
        chrome.tabs.create({url});
    }
}
// The simple implementation
async function focusOrCreateNewTabSimple(url, reload = false) {
    const tabs = await queryTabs({url, currentWindow: true});
    const activeTabId  = tabs.find(tab => tab.active)?.id;
    const lastTabId  = tabs[tabs.length - 1]?.id;
    const firstTabId = tabs[0]?.id;
    const tabId = activeTabId || lastTabId;

    if (tabId) {
        chrome.tabs.update(tabId, {
            active: true,
            url: reload ? url : null
        });
    } else {
        chrome.tabs.create({url});
    }
}
