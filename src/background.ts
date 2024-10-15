import {
    emojiToDataURL, emojiToBlobURL,
    logPicture, logBlue, sleep,
} from "@/util";
import {extensionName, inIncognitoContext} from "@/util-ext";
import {countTabs}           from "@/bg/tab-counter";
import {logImageOnMessage}   from "@/bg/log-image";
import {enableQuickAccessUrlOpenerMode} from "@/bg/quick-access-url-opener";

import {initVisitBackgroundHandler} from "@/bg/visits";
import {updateStoreModel}           from "@/bg/bg-store-updater";

import {initContextMenu}            from "@/bg/bg-init-context-menu";
import {initPS_ChangeIcon}          from "@/bg/bg--ps-change-icon";
import {initGS_GetTabs}             from "@/bg/bg--gs-get-tabs";
import {initGS_GetLastTabs}         from "@/bg/bg--gs-get-last-tabs";
import {initES_FocusOrCreateNewTab} from "@/bg/bg--ss-create-new-tab";


;(async function main(): Promise<void> {
    logBlue("[background.js]", `"${extensionName}" is loading`)();
    logBlue("[background.js]", `Incognito: "${inIncognitoContext}"`)();

    await updateStoreModel();

    initContextMenu(["reload_extension", "yandex_images", "download_shelf", "open_list"]);

    initPS_ChangeIcon();
    initGS_GetTabs();
    initGS_GetLastTabs();
    initES_FocusOrCreateNewTab();

    logImageOnMessage();

    void countTabs();
    void enableQuickAccessUrlOpenerMode();
    initVisitBackgroundHandler();

    chrome.runtime.onMessage.addListener(function logEverything(message, sender) {
        console.log(`[${inIncognitoContext ? "⬛" : "⬜"}][Incoming message]`, message, {from: sender});
    });

    void (async function imgLogTest() {
        await sleep(10);
        const url = await emojiToBlobURL("🔲");
        console.log("Test picture log:");
        logPicture(url);
        logPicture(emojiToDataURL("🔲"));
    })();
    void (async function debugStoreLog() {
        await sleep(2000);
        chrome.storage.local.get(store => logBlue("[⚒]", "chrome.storage.local.get(console.log)", store)());
        chrome.bookmarks.getTree(tree => logBlue("[⚒]", "chrome.bookmarks.getTree(console.log)", tree)());

        // chrome.storage.local.get(store => console.log(JSON.stringify(store, null, " ")));
        // chrome.bookmarks.getTree(bookmarks => console.log(JSON.stringify(bookmarks)));

        // chrome.downloads.setShelfEnabled(false);
    })();

})();
