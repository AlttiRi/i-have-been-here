import {getPopup, getTitle, focusOrCreateNewTab, getActiveTabId} from "../util-ext-bg.js";
import {watch} from "../libs/vue-reactivity.js";
import {bom, quickAccessUrl} from "./store/store.js";


export async function openQuickAccessUrl() {
    console.log("openQuickAccessUrl");
    return focusOrCreateNewTab(await quickAccessUrl.getValue());
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
    chrome.browserAction.setTitle({title: "Open " + quickAccessUrl.value});
    chrome.browserAction.onClicked.addListener(openQuickAccessUrl);
}
function disable() {
    restoreState();
    chrome.browserAction.onClicked.removeListener(openQuickAccessUrl);
}


async function toggle(enabled) {
    if (enabled) {
        await enable();
    } else {
        disable();
    }
}

export async function enableBookmarksOpenerMode() {
    const checked = await bom.getValue();
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

