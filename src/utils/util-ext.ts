import {StoreLocalModel} from "@/common/types";
import {logOrange} from "@/utils/util";


export const extensionName = chrome.i18n.getMessage("extension_name");
export const extensionId   = chrome.runtime.id;
export const extensionUUID = chrome.i18n.getMessage("@@extension_id");
export const inIncognitoContext = chrome.extension.inIncognitoContext;

export const manifest     = chrome.runtime.getManifest();
export const defaultIcon  = manifest.browser_action!.default_icon;
export const defaultTitle = manifest.browser_action!.default_title;
export const defaultPopup = manifest.browser_action!.default_popup;



/**
 * Sends a message to an extension's bg script, or to any extension's page (popup, option, a custom page)
 * Also, possible (not implemented in this wrapper) sending to another extension.
 *
 * It's possible to send a message FROM a content script, but not TO.
 * For sending to a content script use `exchangeMessageWithTab`
 *
 * The subscriber must use `sendResponse` to send a response message back
 * to prevent the `The message port closed before a response was received.` error.
 *
 * @example
 * ```js
 * chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
 *     if (!isThisMessageForMe(message)) {
 *         return;
 *     }
 *     const response = handler(message);
 *     if (isPromise(response)) {
 *         response.then(sendResponse);
 *         return true;
 *     } else {
 *         sendResponse(response);
 *     }
 * });
 * BTW, `sender` has no `sender.tab` property if the message is from the bg script.
 * ```
 * @deprecated Use `ExchangeService`.
 * @see {import("../common/classes/messages").ExchangeService}
 * @see {import("./util-ext").exchangeMessageWithTab}
 */
export function exchangeMessage(message: any): Promise<any> {
    console.log("[sendMessage][send]", message);
    return new Promise(async (resolve, reject) => {
        chrome.runtime.sendMessage(message, response => {
            console.log("[sendMessage][received]", response);
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
            }
            resolve(response);
        });
    });
}

/**
 * Send a message from the background script to a tab's content script and get the response back.
 * @see {import("./util-ext").SendResponse}
 * @see {import("./util-ext").exchangeMessage}
 */
export function exchangeMessageWithTab(tabId: number, message: any): Promise<any> {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, function responseCallback(response) {
            console.log(`[exchangeMessageWithTab] Tab's (${tabId}) response:`, response);
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
            }
            resolve(response);
        });
    });
}

// [note] For exporting
// chrome.storage.local.get(store => console.log(JSON.stringify(store, null, " ")));

export function setToStoreLocal<K extends keyof StoreLocalModel>(key: K, value: StoreLocalModel[K]): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({[key]: value}, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}

export function setToStoreLocalMany<K extends keyof StoreLocalModel>(object: Record<K, StoreLocalModel[K]>):  Promise<void>;
export function setToStoreLocalMany<K extends keyof StoreLocalModel>(records: [K, StoreLocalModel[K]][]): Promise<void>;
// [note] Don't use Array<...>, either it will suggest Array's method for the object input.
export function setToStoreLocalMany<K extends keyof StoreLocalModel>(records: Record<K, StoreLocalModel[K]> | [K, StoreLocalModel[K]][]): Promise<void> {
    if (Array.isArray(records)) {
        records = Object.fromEntries(records) as Record<K, StoreLocalModel[K]>;
    }
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(records, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}

export function getFromStoreLocal(): Promise<StoreLocalModel>;
export function getFromStoreLocal<K extends keyof StoreLocalModel>(key:  K): Promise<StoreLocalModel[K]>
export function getFromStoreLocal<K extends keyof StoreLocalModel>(key?: K): Promise<StoreLocalModel[K] | StoreLocalModel> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key ? [key] : null, object => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
            }
            resolve(key ? object[key] : object);
        });
    });
}
export function removeFromStoreLocal<K extends keyof StoreLocalModel>(key: K): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.remove([key], () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}


export function setIcon(details: chrome.browserAction.TabIconDetails): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        chrome.browserAction.setIcon(details, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}

export function setBadgeText(details: chrome.browserAction.BadgeTextDetails): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        chrome.browserAction.setBadgeText(details, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}

export function getBadgeText(details: chrome.browserAction.BadgeTextDetails): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        chrome.browserAction.getBadgeText(details, (result: string) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError.message);
            }
            resolve(result);
        });
    });
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


export function queryTabs(queryInfo?: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    return new Promise(resolve => chrome.tabs.query(queryInfo || {}, resolve));
}

export function getTab(tabId: number): Promise<chrome.tabs.Tab | undefined> {
    return new Promise(resolve => chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
            logOrange("[warning][getTab]", chrome.runtime.lastError.message)();
            resolve(undefined);
        }
        return resolve(tab);
    }));
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
        logOrange("[warning][getActiveTab] tabs.length === 0")(); // When DevTools was focused.
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

export function openOptions(old = true) {
    if (old) {
        chrome.tabs.create({
            url: "chrome://extensions/?options=" + chrome.runtime.id
        });
    } else {
        chrome.runtime.openOptionsPage();
    }
}
