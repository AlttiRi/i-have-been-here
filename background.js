import {
    emojiToDataURL,
    emojiToBlobURL,
    extensionName,
    inIncognitoContext,
    logPicture,
    emojiToImageData, getActiveTabId
} from "./util.js";
import {countTabs} from "./bg/tab-counter.js"
import {changeIconOnMessage} from "./bg/change-icon-on-message.js"
import {logImageOnMessage} from "./bg/log-image.js"
import {registerContextMenu} from "./bg/context-menu.js"
import {enableBookmarksOpenerMode} from "./bg/opera-bookmark-opener.js";
import {Store} from "./bg/store.js";
import {visitedBtnHandler} from "./bg/visited.js";

console.log(`[${extensionName}] background.js loaded.`);
console.log(`Incognito: ${inIncognitoContext}.`);

changeIconOnMessage("change-icon");
logImageOnMessage("take-screenshot");

countTabs().then(/*nothing*/);
enableBookmarksOpenerMode();
visitedBtnHandler();
registerContextMenu(["reload", "yandex_images", "download_shelf"]);




console.log("Test picture log:");
emojiToBlobURL("🔲").then(url => {
    logPicture(url);
});
logPicture(emojiToDataURL("🔲"));


chrome.storage.local.get(console.log);
chrome.bookmarks.getTree(console.log);
// chrome.bookmarks.getTree(o => console.log(JSON.stringify(o)));



// Just a demo
// Store.bookmarkOpenerMode = true;
// Store.bookmarkOpenerMode.then(res => console.log("Store.bookmarkOpenerMode", res));

// Old
// chrome.downloads.setShelfEnabled(false);



















