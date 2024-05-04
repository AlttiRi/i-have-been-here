// Count tabs with separation for incognito and normal mode
// + changes icon

import {queryTabs} from "@/src/util-ext-bg";
import {visitedIconDataIfRequired} from "@/src/bg/visits";

import {urlOpenerMode} from "@/src/bg/store/store";
import {watch} from "vue";


const tabsArray: chrome.tabs.Tab[] = [];
const imgFilename = chrome.extension.inIncognitoContext ? "images/2.png" : "images/1.png";
const imgPath: string = chrome.runtime.getURL(imgFilename);

export async function countTabs() {
    console.log("[countTabs] onStart");

    const tabs = await queryTabs();
    tabsArray.push(...tabs);

    setDefaultIcon(imgPath);
    updateIcons(tabsArray);
    updateBadgesText(tabsArray);

    addListeners();
}

function addListeners() {

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        console.log("[onUpdated]", tabId, changeInfo, tab);
        if (changeInfo.status) {
            updateIcons([tab]);
            updateBadgesText([tab]);
        }
    });

    chrome.tabs.onCreated.addListener(tab => {
        console.log("[onCreated]", tab);
        tabsArray.push(tab);
        updateBadgesText(tabsArray);
    });

    // todo if closed multiple tabs? upd: it looks working
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
        console.log("onRemoved", tabId, removeInfo);
        const tab = tabsArray.find(tab => tab.id === tabId);
        if (tab === undefined) {
            console.warn("[warning][onRemoved] tabs === undefined");
            return;
        }
        const index = tabsArray.indexOf(tab);
        if (index !== -1) {
            tabsArray.splice(index, 1);
            updateBadgesText(tabsArray);
        } else {
            console.warn(`[warning][onRemoved] tab.id ${tabId} is not found`);
        }
    });

    chrome.windows.onFocusChanged.addListener((windowId, filters) => {
        console.log("onFocusChanged", windowId);
        // Does not seem to be required any more
        // if (windowId !== chrome.windows.WINDOW_ID_NONE) { // incognito, devtools
        //     setDefaultIcon(imgPath);
        // }
    });
}


/** Ignores tabs with an icon set with `tabId` parameter */
function setDefaultIcon(path: string) {
    chrome.browserAction.setIcon({
        path,
    });
}

watch(urlOpenerMode.ref, async () => {
    updateIcons(await queryTabs());
});

export function updateIcons(tabs: chrome.tabs.Tab[]): void {
    console.log("setIcons", tabs);
    tabs.forEach(async tab => {
        if (!urlOpenerMode.isReady) {
            await urlOpenerMode.onReady;
        }
        let tabCounterIconData = {path: imgPath};
        let other = null;

        if (!urlOpenerMode.value) {
            other = await visitedIconDataIfRequired(tab);
        }
        chrome.browserAction.setIcon({
            ...(other || tabCounterIconData),
            tabId: tab.id
        }, () => {
            if (chrome.runtime.lastError) {
                console.warn("[error][updateIcons]", chrome.runtime.lastError.message);
            }
        });
    });
}

function updateBadgesText(tabs: chrome.tabs.Tab[]): void {
    console.log("[updateBadgesText]", tabs);
    tabs.forEach(tab => {
        chrome.browserAction.setBadgeText({
            text: (tabsArray.length).toString(),
            tabId: tab.id
        }, () => {
            if (chrome.runtime.lastError) { // if tab does not exists // todo debounce onclose event
                console.warn("[error][updateBadgesText]", chrome.runtime.lastError.message);
            }
        });
    });
}
