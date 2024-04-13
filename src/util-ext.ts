export const extensionName = chrome.i18n.getMessage("extension_name");
export const extensionId = chrome.runtime.id;
export const extensionUUID = chrome.i18n.getMessage("@@extension_id");
export const inIncognitoContext = chrome.extension.inIncognitoContext;

export const manifest     = chrome.runtime.getManifest();
export const defaultIcon  = manifest.browser_action!.default_icon;
export const defaultTitle = manifest.browser_action!.default_title;
export const defaultPopup = manifest.browser_action!.default_popup;

/**
 * Send message to bg, or ony extension's page (popup, options, a custom page)
 * Also possible (not implemented in this wrapper) sending to another extension.
 *
 * It's possible to send a message FROM a content script, but not TO.
 * For sending to a content script use `sendMessageToTab`
 *
 * The subscriber must use `sendResponse` to send response message back:
 * `chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {`
 * to prevent the `The message port closed before a response was received.` error.
 * @see {import("src/util-ext-bg.js").exchangeMessageWithTab}
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

// For exporting
// chrome.storage.local.get(store => console.log(JSON.stringify(store, null, " ")));

export function setToStoreLocal(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({[key]: value}, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}

export function getFromStoreLocal(key?: string): Promise<any> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key ? [key] : null, object => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve(key ? object[key] : object);
        });
    });
}
export function removeFromStoreLocal(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.remove([key], () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}


