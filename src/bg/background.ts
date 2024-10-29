import {sleep} from "@alttiri/util-js";
import {
    emojiToDataURL, emojiToBlobURL,
    logPicture, logBlue,
} from "@/utils/util";
import {
    extensionName, inIncognitoContext
} from "@/utils/util-ext";
import {initStartupListeners, updateStoreModel} from "@/bg/store-updater";
import {initLogEverything}            from "@/bg/inits/message-logger";
import {initBadgesAndIcons}           from "@/bg/inits/badges-icons";
import {initContextMenu}              from "@/bg/inits/context-menu";
import {initQuickAccessUrlOpenerMode} from "@/bg/inits/quick-access-url-opener";
import {initPS_ChangeIcon}          from "@/bg/listeners/ps-change-icon";
import {initGS_GetTabs}             from "@/bg/listeners/gs-get-tabs";
import {initGS_GetLastTabs}         from "@/bg/listeners/gs-get-last-tabs";
import {initES_FocusOrCreateNewTab} from "@/bg/listeners/ss-create-new-tab";
import {initMH_Visit}               from "@/bg/listeners/mh-visit";
import {initMH_Screenshot}          from "@/bg/listeners/mh-screenshot";


void (async function mainBG(): Promise<void> {
    logBlue("[background.js]", `"${extensionName}" is loading`)();
    logBlue("[background.js]", `Incognito: "${inIncognitoContext}"`)();

    initStartupListeners();
    await updateStoreModel();

    initLogEverything();
    void initBadgesAndIcons();
    void initQuickAccessUrlOpenerMode();
    initContextMenu(["reload_extension", "yandex_images", "download_shelf", "open_list"]);

    initPS_ChangeIcon();
    initGS_GetTabs();
    initGS_GetLastTabs();
    initES_FocusOrCreateNewTab();
    initMH_Visit();
    initMH_Screenshot();
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
}) // () /* un/comment `()` to en/dis-able */
;

// @ts-ignore
globalThis.reload = chrome.runtime.reload;
