import {getPopup, getTitle, focusOrCreateNewTab, getActiveTabId} from "../util-ext-bg.js";
import {watch} from "/libs/vue-reactivity.js";
import {urlOpenerMode, quickAccessUrl} from "./store/store.js";


export async function openQuickAccessUrl() {
    console.log("openQuickAccessUrl");
    return focusOrCreateNewTab(await quickAccessUrl.getValue());
}

/** @type {{title, popup, saved}} */
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
    state.saved = false;
}

export async function enableQuickAccessUrlOpenerMode() {
    const checked = await urlOpenerMode.getValue();
    const id = "quick_access_url_opener";
    chrome.contextMenus.create({
        id,
        title: "🔖 URL opener mode",
        contexts: ["browser_action"],
        type: "checkbox",
        checked
    });
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === id) {
            void urlOpenerMode.setValue(info.checked);
        }
    });

    watch([urlOpenerMode.ref, quickAccessUrl.ref], async () => {
        chrome.contextMenus.update(id, {checked: urlOpenerMode.value});
        if (urlOpenerMode.value) {
            if (!state.saved) {
                await saveState();
                chrome.browserAction.setPopup({popup: ""});
                chrome.browserAction.onClicked.addListener(openQuickAccessUrl);
                state.saved = true;
            }
            chrome.browserAction.setTitle({title: "Open " + quickAccessUrl.value});
        } else if (state.saved) {
            restoreState();
            chrome.browserAction.onClicked.removeListener(openQuickAccessUrl);
        }
    }, {
        immediate: true
    });
}

