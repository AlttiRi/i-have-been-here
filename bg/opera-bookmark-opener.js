import {getPopup, getTitle, focusOrCreateNewTab, getActiveTabId} from "../util-ext-bg.js";
import {isOpera} from "../util.js";

export function openBookmarks() {
    const url = "chrome://startpage/bookmarks";
    return focusOrCreateNewTab(url);
}

/** @type {{title, popup}} */
const state = {};
async function saveState() {
    const tabId = await getActiveTabId();
    state.popup = await getPopup({tabId});
    state.title = await getTitle({tabId});
}
function restoreState() {
    const {popup, title} = state;
    chrome.browserAction.setPopup({popup});
    chrome.browserAction.setTitle({title});
}

async function enable() {
    await saveState();
    chrome.browserAction.setPopup({popup: ""});
    chrome.browserAction.setTitle({title: "Open Bookmarks"});
    chrome.browserAction.onClicked.addListener(openBookmarks);
}
function disable() {
    restoreState();
    chrome.browserAction.onClicked.removeListener(openBookmarks);
}


async function toggle(enabled) {
    if (enabled) {
        await enable();
    } else {
        disable();
    }
}

import {bookmarkOpenerMode, isBOMReady, onBOMReady, setBookmarkOpenerMode} from "./store/bom.js";
import {watch} from "../libs/vue-reactivity.js";
export async function enableBookmarksOpenerMode() {
    if (!isOpera) {
        console.log("[info] Not Opera");
        return;
    }

    if (!isBOMReady.value) {
        await onBOMReady;
    }
    const checked = bookmarkOpenerMode.value;
    chrome.contextMenus.create({
        id: "bookmark_opener",
        title: "Bookmark 🔖 opener mode",
        contexts: ["browser_action"],
        type: "checkbox",
        checked
    });
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === "bookmark_opener") {
            void setBookmarkOpenerMode(info.checked);
        }
    });

    if (checked) {
        await enable();
    }
    watch(bookmarkOpenerMode, () => {
        void toggle(bookmarkOpenerMode.value);
    });
}

