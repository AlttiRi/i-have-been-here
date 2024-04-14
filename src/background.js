import {
    emojiToDataURL,
    emojiToBlobURL,
    logPicture,
} from "./util.js";
import {extensionName, inIncognitoContext} from "./util-ext.js";
import {countTabs} from "./bg/tab-counter.js"
import {changeIconOnMessage} from "./bg/change-icon-on-message.js"
import {logImageOnMessage} from "./bg/log-image.js"
import {registerContextMenu} from "./bg/context-menu.js"
import {enableQuickAccessUrlOpenerMode} from "./bg/quick-access-url-opener.js";

import {initVisitBackgroundHandler} from "./bg/visits.js";
import {initGetTabsListener} from "./bg/get-tabs.js";


console.log(`[${extensionName}] background.js loaded.`);
console.log(`Incognito: ${inIncognitoContext}.`);

changeIconOnMessage();
logImageOnMessage();

void countTabs();
void enableQuickAccessUrlOpenerMode();
initVisitBackgroundHandler();
registerContextMenu(["reload", "yandex_images", "download_shelf", "open_list"]);

initGetTabsListener();


chrome.runtime.onMessage.addListener((message, sender) => {
    console.log("[BG incoming message]", {message}, "sender:", sender); // Logs any income messages
});

console.log("Test picture log:");
emojiToBlobURL("🔲").then(url => {
    logPicture(url);
});
logPicture(emojiToDataURL("🔲"));

console.log("chrome.storage.local.get(console.log)");
console.log("chrome.bookmarks.getTree(console.log)");
chrome.storage.local.get(store => console.log("[===][storage.local]", store));
chrome.bookmarks.getTree(tree => console.log("[===][bookmarks]", tree));
// chrome.storage.local.get(store => console.log(JSON.stringify(store, null, " ")));
// chrome.bookmarks.getTree(bookmarks => console.log(JSON.stringify(bookmarks)));

// chrome.downloads.setShelfEnabled(false);














