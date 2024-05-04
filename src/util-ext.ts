import {StoreLocalModel} from "@/src/types";

export const extensionName = chrome.i18n.getMessage("extension_name");
export const extensionId = chrome.runtime.id;
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
 * @see {import("./util-ext-messages.js").ExchangeService}
 * @see {import("./util-ext.js").exchangeMessageWithTab}
 */
export function exchangeMessage(message: any): Promise<any> {
    console.log("[sendMessage][send]", message);
    return new Promise(async (resolve, reject) => {
        chrome.runtime.sendMessage(message, response => {
            console.log("[sendMessage][received]", response);
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve(response);
        });
    });
}

/**
 * Send a message from the background script to a tab's content script and get the response back.
 * @see {import("./util-ext.js").SendResponse}
 * @see {import("./util-ext.js").exchangeMessage}
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

// [note] For exporting
// chrome.storage.local.get(store => console.log(JSON.stringify(store, null, " ")));

export function setToStoreLocal<K extends keyof StoreLocalModel>(key: K, value: StoreLocalModel[K]): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({[key]: value}, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
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
                reject(chrome.runtime.lastError.message);
            }
            resolve(key ? object[key] : object);
        });
    });
}
export function removeFromStoreLocal<K extends keyof StoreLocalModel>(key: K): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.remove([key], () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}
