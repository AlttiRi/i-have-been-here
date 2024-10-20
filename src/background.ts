import {sleep} from "@alttiri/util-js";
import {
    emojiToDataURL, emojiToBlobURL,
    logPicture, logBlue,
} from "@/util";
import {
    extensionName, inIncognitoContext
} from "@/util-ext";
import {initStartupListeners, updateStoreModel} from "@/bg/bg-store-updater";
import {initLogEverything}          from "@/bg/bg-init-message-logger";
import {initContextMenu}            from "@/bg/bg-init-context-menu";
import {initPS_ChangeIcon}          from "@/bg/bg--ps-change-icon";
import {initGS_GetTabs}             from "@/bg/bg--gs-get-tabs";
import {initGS_GetLastTabs}         from "@/bg/bg--gs-get-last-tabs";
import {initES_FocusOrCreateNewTab} from "@/bg/bg--ss-create-new-tab";
import {initMH_Visit}               from "@/bg/bg--mh-visit";

import {initQuickAccessUrlOpenerMode} from "@/bg/bg-init-quick-access-url-opener";

import {countTabs}                    from "@/bg/tab-counter";
import {logImageOnMessage}            from "@/bg/log-image";


void (async function main(): Promise<void> {
    logBlue("[background.js]", `"${extensionName}" is loading`)();
    logBlue("[background.js]", `Incognito: "${inIncognitoContext}"`)();

    initStartupListeners();
    await updateStoreModel();

    initLogEverything();
    initContextMenu(["reload_extension", "yandex_images", "download_shelf", "open_list"]);

    initPS_ChangeIcon();
    initGS_GetTabs();
    initGS_GetLastTabs();
    initES_FocusOrCreateNewTab();
    initMH_Visit();

    void initQuickAccessUrlOpenerMode();

    logImageOnMessage();

    void countTabs();
})();

void (async function tests(): Promise<void> {
    await sleep(2000);
    logBlue("[⚒]", "imgLogTest")();
    await (async function imgLogTest() {
        const url = await emojiToBlobURL("🔲");
        logBlue("[⚒]", "picture:")();
        await logPicture(url);
        await logPicture(emojiToDataURL("🔲"));
    })();
    logBlue("[⚒]", "debugStoreLog")();
    (function debugStoreLog() {
        chrome.storage.local.get(store => logBlue("[⚒]", "chrome.storage.local.get(console.log)", store)());
        chrome.bookmarks.getTree(tree => logBlue("[⚒]", "chrome.bookmarks.getTree(console.log)", tree)());

        // chrome.storage.local.get(store => console.log(JSON.stringify(store, null, " ")));
        // chrome.bookmarks.getTree(bookmarks => console.log(JSON.stringify(bookmarks)));

        // chrome.downloads.setShelfEnabled(false);
    })();
})();
