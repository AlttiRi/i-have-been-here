import {getPopup, getTitle, focusOrCreateNewTab, getActiveTabId} from "../util-ext-bg.js";
import {Store} from "./store.js";

async function openBookmarks() {
    const url = "chrome://startpage/bookmarks";
    focusOrCreateNewTab(url).then();
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

export function enableBookmarksOpenerMode() {
    Store.bookmarkOpenerMode.onValueOnce(checked => {
        chrome.contextMenus.create({
            id: "bookmark_opener",
            title: "Bookmark opener mode",
            contexts: ["browser_action"],
            type: "checkbox",
            checked
        });
    });
    Store.bookmarkOpenerMode.onValue(value => {
        void toggle(value);
    });
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
        if (info.menuItemId === "bookmark_opener") {
            Store.bookmarkOpenerMode.value = info.checked;
        }
    });
}

