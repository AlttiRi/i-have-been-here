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
import {enableBookmarksOpenerMode} from "./bg/opera-bookmark-opener.js";

import {initVisitBackgroundHandler} from "./bg/visits.js";

console.log(`[${extensionName}] background.js loaded.`);
console.log(`Incognito: ${inIncognitoContext}.`);

changeIconOnMessage();
logImageOnMessage();

void countTabs();
void enableBookmarksOpenerMode();
initVisitBackgroundHandler();
registerContextMenu(["reload", "yandex_images", "download_shelf", "open_list"]);


chrome.runtime.onMessage.addListener((message, sender) => {
    console.log("[BG incoming message]", message, sender); // Logs any income messages
});

console.log("Test picture log:");
emojiToBlobURL("🔲").then(url => {
    logPicture(url);
});
logPicture(emojiToDataURL("🔲"));


chrome.storage.local.get(console.log);
chrome.bookmarks.getTree(console.log);
// chrome.storage.local.get(store => console.log(JSON.stringify(store, null, " ")));
// chrome.bookmarks.getTree(bookmarks => console.log(JSON.stringify(bookmarks)));

// chrome.downloads.setShelfEnabled(false);
















