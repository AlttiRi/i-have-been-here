import {sleep} from "@alttiri/util-js";
import {
    emojiToDataURL, emojiToBlobURL,
    logPicture, logBlue,
} from "@/utils/util";
import {
    extensionName, inIncognitoContext, setToStoreLocal
} from "@/utils/util-ext";
import {initStartupListeners, updateStoreModel} from "@/bg/store-updater";
import {initLogEverything}            from "@/bg/inits/message-logger";
import {initBadgesAndIcons}           from "@/bg/inits/badges-icons";
import {initContextMenu}              from "@/bg/inits/context-menu";
import {initQuickAccessUrlOpenerMode} from "@/bg/inits/quick-access-url-opener";
import {initIconBlinking}          from "@/bg/listeners/blink-icon";
import {initTabsGetting}           from "@/bg/listeners/get-tabs";
import {initLastTabsGetting}       from "@/bg/listeners/get-last-tabs";
import {initTabCreatingOrFocusing} from "@/bg/listeners/new-tab";
import {initVisitListeners}        from "@/bg/listeners/visits";
import {initScreenshotListeners}   from "@/bg/listeners/screenshot";
import {initPingPonging}           from "@/bg/listeners/ping-pong-bg";


void (async function mainBG(): Promise<void> {
    const start = Date.now();
    logBlue("[background.js]", `"${extensionName}" is loading`)();
    logBlue("[background.js]", `Incognito: "${inIncognitoContext}"`)();
    void setToStoreLocal("bgLoadingStartTime", start);

    initStartupListeners();
    await updateStoreModel();

    initLogEverything();
    void initBadgesAndIcons();
    void initQuickAccessUrlOpenerMode();
    initContextMenu(["reload_extension", "yandex_images", "download_shelf", "open_list"]);

    initIconBlinking();
    initTabsGetting();
    initLastTabsGetting();
    initTabCreatingOrFocusing();
    initVisitListeners();
    initScreenshotListeners();
    initPingPonging();

    const end = Date.now();
    void setToStoreLocal("bgLoadingEndTime", end);
    logBlue("[background.js]", "loading time", end - start)();
})().then(() => {
    // void tests(); /* un/comment to en/dis-able */
});

// just some experiments
async function tests(): Promise<void> {
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
}

// @ts-ignore
globalThis.reload = chrome.runtime.reload;
