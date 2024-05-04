import {
    emojiToDataURL,
    emojiToBlobURL,
    logPicture, sleep,
} from "@/src/util";
import {extensionName, inIncognitoContext} from "@/src/util-ext";
import {countTabs} from "@/src/bg/tab-counter"
import {changeIconOnMessage} from "@/src/bg/change-icon-on-message"
import {logImageOnMessage} from "@/src/bg/log-image"
import {registerContextMenu} from "@/src/bg/context-menu"
import {enableQuickAccessUrlOpenerMode} from "@/src/bg/quick-access-url-opener";

import {initVisitBackgroundHandler} from "@/src/bg/visits";
import {initGetTabsListener} from "@/src/bg/get-tabs";
import {updateStoreModel} from "@/src/bg/store-updaters";

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
        await sleep(2000);
        chrome.storage.local.get(store => console.log("[⚒] chrome.storage.local.get(console.log)", store));
        chrome.bookmarks.getTree(tree => console.log("[⚒] chrome.bookmarks.getTree(console.log)", tree));

        // chrome.storage.local.get(store => console.log(JSON.stringify(store, null, " ")));
        // chrome.bookmarks.getTree(bookmarks => console.log(JSON.stringify(bookmarks)));

        // chrome.downloads.setShelfEnabled(false);
    })();

})();
