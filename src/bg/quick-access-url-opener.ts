import {watch} from "vue";
import {getPopup, getTitle, focusOrCreateNewTab, getActiveTabId} from "@/util-ext-bg";
import {urlOpenerMode, quickAccessUrl} from "@/bg/store/store";


export async function openQuickAccessUrl(): Promise<chrome.tabs.Tab | undefined> {
    console.log("openQuickAccessUrl");
    return focusOrCreateNewTab(await quickAccessUrl.getValue());
}

type State = {title: string, popup: string, saved: boolean};
const state: State = {popup: "", title: "", saved: false};
async function saveState() {
    const tabId = await getActiveTabId();
    state.popup = await getPopup({tabId});
    state.title = await getTitle({tabId});
    state.saved = true;
}
function restoreState() {
    const {popup, title} = state;
    chrome.browserAction.setPopup({popup});
    chrome.browserAction.setTitle({title});
    state.saved = false;
}

export async function enableQuickAccessUrlOpenerMode() {
    const checked: boolean = await urlOpenerMode.getValue();
    const id = "quick_access_url_opener";
    chrome.contextMenus.create({
        id,
        title: "🔖 URL opener mode",
        contexts: ["browser_action"],
        type: "checkbox",
        checked
    });
    chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, _tab: chrome.tabs.Tab | undefined) => {
        if (info.menuItemId === id) {
            void urlOpenerMode.setValue(info.checked!); // must not be `undefined` since `type: "checkbox"`
        }
    });

    watch([urlOpenerMode.ref, quickAccessUrl.ref], async () => {
        chrome.contextMenus.update(id, {checked: urlOpenerMode.value});
        if (urlOpenerMode.value) {
            if (!state.saved) {
                await saveState();
                chrome.browserAction.setPopup({popup: ""});
                chrome.browserAction.onClicked.addListener(openQuickAccessUrl);
            }
            chrome.browserAction.setTitle({title: "Open " + quickAccessUrl.value});
        } else if (state.saved) {
            chrome.browserAction.onClicked.removeListener(openQuickAccessUrl);
            restoreState();
        }
    }, {
        immediate: true
    });
}

