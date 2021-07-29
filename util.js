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

export const sendMessage = function(message) {
    console.log("sendMessage[send]", message);
    return new Promise(async resolve => {
        chrome.runtime.sendMessage(message, response => {
            console.log("sendMessage[received]", response);
            resolve(response);
        });
    });
}

export const sendMessageToTab = function(tabId, message) {
    return new Promise(resolve => {
        chrome.tabs.sendMessage(tabId, message, response => {
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

    // // The simple implementation
    // const tabs = await queryTabs({url, currentWindow: true});
    // const activeTabId  = tabs.find(tab => tab.active)?.id;
    // const lastTabId  = tabs[tabs.length - 1]?.id;
    // const firstTabId = tabs[0]?.id;
    // const tabId = activeTabId || lastTabId;
    //
    // if (tabId) {
    //     chrome.tabs.update(tabId, {
    //         active: true,
    //         url: reload ? url : null
    //     });
    // } else {
    //     chrome.tabs.create({url});
    // }
}

export const extensionName = chrome.i18n.getMessage("extension_name");

export function openOptions(old = true) {
    if (old) {
        chrome.tabs.create({
            url: "chrome://extensions/?options=" + chrome.runtime.id
        });
    } else {
        chrome.runtime.openOptionsPage();
    }
}

export const inIncognitoContext = chrome.extension.inIncognitoContext;


export function logPicture(url, scale) {
    logPictureAsync(url, scale).then(/*nothing*/)
}

export async function logPictureAsync(url, scale = 0.5) {
    let dataUrl;
    if (isBlobUrl(url)) {
        dataUrl = await blobUrlToDataUrl(url);
    } else {
        dataUrl = url;
    }

    const img = new Image();
    const imageLoaded = new Promise(resolve => img.onload = resolve);
    img.src = dataUrl;
    await imageLoaded;

    console.log("%c ", `
       padding: ${Math.floor(img.height * scale / 2)}px ${Math.floor(img.width * scale / 2)}px;
       background: url("${img.src}");
       background-size: ${img.width * scale}px ${img.height * scale}px;
       font-size: 0;
    `);
}
console.image = logPicture;

async function blobUrlToDataUrl(blobUrl) {
    const response = await fetch(blobUrl);
    const blob = await response.blob()
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.readAsDataURL(blob);
    });
}

function isBlobUrl(url) {
    return url.toString().startsWith("blob:");
}


export function emojiToImageData(emoji, size = 64, multiplier = 1) {
    const {context} = emojiTo(emoji, size, multiplier);
    return context.getImageData(0, 0, size, size);
}

export function emojiToBlob(emoji, size, multiplier) {
    const {canvas} = emojiTo(emoji, size, multiplier);
    return new Promise(resolve => canvas.toBlob(resolve));
}

export function emojiToDataURL(emoji, size, multiplier) {
    const {canvas} = emojiTo(emoji, size, multiplier);
    const dataUrl = canvas.toDataURL("png", 100);
    // console.log(dataUrl);
    return dataUrl;
}

export async function emojiToBlobURL(emoji, size, multiplier, revokeDelay = 100000) {
    const blob = await emojiToBlob(emoji, size, multiplier);
    const url = URL.createObjectURL(blob);
    // console.log(url, blob, await blob.arrayBuffer());
    setTimeout(_ => URL.revokeObjectURL(url), revokeDelay);
    return url;
}

/** @return {{canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}} */
function emojiTo(emoji = "⬜", size = 64, multiplier = 1.01) {

    /** @type {HTMLCanvasElement} */
    const canvas = document.createElement("canvas");
    canvas.width  = size;
    canvas.height = size;
    /** @type {CanvasRenderingContext2D} */
    const context = canvas.getContext("2d");

    context.font = size * 0.875 * multiplier + "px serif";
    context.textBaseline = "middle";
    context.textAlign = "center";

    const x = size / 2;
    const y = size / 2 + Math.round(size - size * 0.925);

    context.fillText(emoji, x, y);

    return {canvas, context};
}

// "Sun, 10 Jan 2021 22:22:22 GMT" -> "2021.01.10"
export function dateToDayDateString(dateValue, utc = true) {
    const _date = new Date(dateValue);
    function pad(str) {
        return str.toString().padStart(2, "0");
    }
    const _utc = utc ? "UTC" : "";
    const year  = _date[`get${_utc}FullYear`]();
    const month = _date[`get${_utc}Month`]() + 1;
    const date  = _date[`get${_utc}Date`]();

    return year + "." + pad(month) + "." + pad(date);
}













