export const extensionName = chrome.i18n.getMessage("extension_name");
export const extensionId = chrome.runtime.id;
export const extensionUUID = chrome.i18n.getMessage("@@extension_id");
export const inIncognitoContext = chrome.extension.inIncognitoContext;

export const sendMessage = function(message) {
    console.log("[sendMessage][send]", message);
    return new Promise(async resolve => {
        chrome.runtime.sendMessage(message, response => {
            console.log("[sendMessage][received]", response);
            resolve(response);
        });
    });
}
