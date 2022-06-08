export const extensionName = chrome.i18n.getMessage("extension_name");
export const extensionId = chrome.runtime.id;
export const extensionUUID = chrome.i18n.getMessage("@@extension_id");
export const inIncognitoContext = chrome.extension.inIncognitoContext;

export function sendMessage(message) {
    console.log("[sendMessage][send]", message);
    return new Promise(async resolve => {
        chrome.runtime.sendMessage(message, response => {
            console.log("[sendMessage][received]", response);
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
