import {
    emojiToDataURL,
    emojiToBlobURL,
    logPicture, sleep,
} from "./util.js";
import {extensionName, inIncognitoContext} from "./util-ext.js";
import {countTabs} from "./bg/tab-counter.js"
import {changeIconOnMessage} from "./bg/change-icon-on-message.js"
import {logImageOnMessage} from "./bg/log-image.js"
import {registerContextMenu} from "./bg/context-menu.js"
import {enableQuickAccessUrlOpenerMode} from "./bg/quick-access-url-opener.js";

import {initVisitBackgroundHandler} from "./bg/visits.js";
import {initGetTabsListener} from "./bg/get-tabs.js";
import {updateStoreModel} from "./bg/store-updaters.js";

;(async function main(): Promise<void> {
    console.log(`[${extensionName}] background.js loaded.`);
    console.log(`Incognito: ${inIncognitoContext}.`);

    await updateStoreModel();

    changeIconOnMessage();
    logImageOnMessage();

    void countTabs();
    void enableQuickAccessUrlOpenerMode();
    initVisitBackgroundHandler();
    registerContextMenu(["reload", "yandex_images", "download_shelf", "open_list"]);

    initGetTabsListener();


    chrome.runtime.onMessage.addListener(function logEverything(message, sender) {
        console.log(`[${inIncognitoContext ? "⬛" : "⬜"}][Incoming message]`, message, {from: sender});
    });

    void (async function imgLogTest(){
        await sleep(10);
        const url = await emojiToBlobURL("🔲");
        console.log("Test picture log:");
        logPicture(url);
        logPicture(emojiToDataURL("🔲"));
    })();
    void (async function debugStoreLog(){
        await sleep(20);
        chrome.storage.local.get(store => console.log("[⚒] chrome.storage.local.get(console.log)", store));
        chrome.bookmarks.getTree(tree => console.log("[⚒] chrome.bookmarks.getTree(console.log)", tree));

        // chrome.storage.local.get(store => console.log(JSON.stringify(store, null, " ")));
        // chrome.bookmarks.getTree(bookmarks => console.log(JSON.stringify(bookmarks)));

        // chrome.downloads.setShelfEnabled(false);
    })();

})();
