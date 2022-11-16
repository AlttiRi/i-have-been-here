import {isTCSReady, onTCSRReady, titleCutterSettings} from "./bg/store/title-cutter-settings.js";

export const extensionName = chrome.i18n.getMessage("extension_name");
export const extensionId = chrome.runtime.id;
export const extensionUUID = chrome.i18n.getMessage("@@extension_id");
export const inIncognitoContext = chrome.extension.inIncognitoContext;

export const manifest     = chrome.runtime.getManifest();
export const defaultIcon  = manifest.browser_action.default_icon;
export const defaultTitle = manifest.browser_action.default_title;
export const defaultPopup = manifest.browser_action.default_popup;

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
 * @see {exchangeMessageWithTab}
 * @param {any} message
 * @return {Promise<any>}
 */
export function exchangeMessage(message) {
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

export function setToStoreLocal(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({[key]: value}, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}

/**
 * @param {string|array|object} [key]
 * @return {Promise<string|array|object|undefined>}
 */
export function getFromStoreLocal(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key ? [key] : null, object => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve(key ? object[key] : object);
        });
    });
}
export function removeFromStoreLocal(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.remove([key], () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            }
            resolve();
        });
    });
}


export async function getTrimmedTitle(title, url) {
    if (!isTCSReady.value) {
        await onTCSRReady;
    }
    const settings = titleCutterSettings.value;
    const _url = new URL(url);
    let _title = title;
    if (settings[_url.hostname]) {
        const hostSettings = settings[_url.hostname];
        hostSettings.trimStartEnd?.forEach(value => {
            if (title.startsWith(value[0]) && title.endsWith(value[1])) {
                _title = _title.slice(value[0].length, -value[1].length);
            }
        });
        hostSettings.trimStart?.forEach(value => {
            if (title.startsWith(value)) {
                _title = _title.slice(value.length);
            }
        });
        hostSettings.trimEnd?.forEach(value => {
            if (title.endsWith(value)) {
                _title = _title.slice(0, -value.length);
            }
        });
    }
    return _title.trim();
}
export async function getTitlePartForFilename(title, url) {
    const needTitle = title && !decodeURIComponent(url).includes(title) && !url.includes(title);
    if (!needTitle) {
        return "";
    }

    const _title = await getTrimmedTitle(title, url);

    let titleLine = " — " + _title
        .replaceAll(/[<>:"\\|?*]+/g, "")
        .replaceAll("/", " ")
        .replaceAll(/\s+/g, " ");

    console.log(titleLine);

    return titleLine;
}
