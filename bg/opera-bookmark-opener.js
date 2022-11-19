import {getPopup, getTitle, focusOrCreateNewTab, getActiveTabId} from "../util-ext-bg.js";
import {isOpera} from "../util.js";

export function openBookmarks() {
    let url = "chrome://bookmarks";
    if (isOpera) {
        url = "chrome://startpage/bookmarks"
    }
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

import {bom} from "./store/bom.js";
import {watch} from "../libs/vue-reactivity.js";
export async function enableBookmarksOpenerMode() {
    if (!isOpera) {
        console.log("[info] Not Opera");
        return;
    }

    if (!bom.isReady) {
        await bom.onReady;
    }
    const checked = bom.value;
    const id = "bookmark_opener";
    chrome.contextMenus.create({
        id,
        title: "Bookmark 🔖 opener mode",
        contexts: ["browser_action"],
        type: "checkbox",
        checked
    });
    watch(bom.ref, () => {
        const checked = bom.value;
        console.log("bookmarkOpenerMode watch", checked);
        chrome.contextMenus.update(id, {checked});
    });
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === "bookmark_opener") {
            void bom.setValue(info.checked);
        }
    });

    if (checked) {
        await enable();
    }
    watch(bom.ref, () => {
        void toggle(bom.value);
    });
}

