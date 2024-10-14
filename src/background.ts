import {
    emojiToDataURL,
    emojiToBlobURL,
    logPicture, sleep,
} from "@/util";
import {extensionName, inIncognitoContext} from "@/util-ext";
import {countTabs}           from "@/bg/tab-counter";
import {logImageOnMessage}   from "@/bg/log-image";
import {registerContextMenu} from "@/bg/context-menu";
import {enableQuickAccessUrlOpenerMode} from "@/bg/quick-access-url-opener";

import {initVisitBackgroundHandler} from "@/bg/visits";
import {updateStoreModel}           from "@/bg/store-updaters";
import {initPS_ChangeIcon}          from "@/bg/bg-ps-change-icon";
import {initGS_GetTabs}             from "@/bg/bg-gs-get-tabs";
import {initGS_GetLastTabs}         from "@/bg/bg-gs-get-last-tabs";
import {initES_FocusOrCreateNewTab} from "@/bg/bg-ss-create-new-tab";

;(async function main(): Promise<void> {
    console.log(`[${extensionName}] background.js loaded.`);
    console.log(`Incognito: ${inIncognitoContext}.`);

    await updateStoreModel();

    logImageOnMessage();

    void countTabs();
    void enableQuickAccessUrlOpenerMode();
    initVisitBackgroundHandler();
    registerContextMenu(["reload", "yandex_images", "download_shelf", "open_list"]);

    initPS_ChangeIcon();
    initGS_GetTabs();
    initGS_GetLastTabs();
    initES_FocusOrCreateNewTab();

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
