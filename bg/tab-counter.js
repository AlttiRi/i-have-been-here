// Count tabs with separation for incognito and normal mode
// + changes icon

import {queryTabs} from "../util-ext-bg.js";
import {visitedIconDataIfRequired} from "./visited.js";
import {Store} from "./store.js";


const tabsArray = [];
const imgFilename = chrome.extension.inIncognitoContext ? "images/2.png" : "images/1.png";
const imgPath = chrome.runtime.getURL(imgFilename);

export async function countTabs() {
    console.log("onStart");

    const tabs = await queryTabs();
    tabsArray.push(...tabs);

    setDefaultIcon(imgPath);
    updateIcons(tabsArray);
    updateBadgesText(tabsArray);

    addListeners();
}

function addListeners() {

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        console.log("onUpdated", tabId, changeInfo, tab);
        if (changeInfo.status) {
            updateIcons([tab]);
            updateBadgesText([tab]);
        }
    });

    chrome.tabs.onCreated.addListener(tab => {
        console.log("Created", tab);
        tabsArray.push(tab);
        updateBadgesText(tabsArray);
    });

    //todo if closed multiple tabs? upd: it looks working
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
        console.log("delete", tabId, removeInfo);
        const index = tabsArray.indexOf(tabsArray.find(tab => tab.id === tabId));
        if (index !== -1) {
            tabsArray.splice(index, 1);
            updateBadgesText(tabsArray);
        } else {
            console.error(`tab.id ${tabId} is not found`);
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


// Sets for all NEW (only!) windows
function setDefaultIcon(path) {
    chrome.browserAction.setIcon({
        path
    });
}

/**
 * @param {chrome.tabs.Tab[]} tabs
 */
export function updateIcons(tabs) {
    console.log("setIcons", tabs);
    tabs.forEach(async tab => {
        // todo? a separate file with registration of icon changers
        Store.bookmarkOpenerMode.onValue(async (bom) => {
            let tabCounterIconData = {path: imgPath};
            let other = null;
            if (!bom) {
                other = await visitedIconDataIfRequired(tab.url);
            }
            chrome.browserAction.setIcon({
                ...(other || tabCounterIconData),
                tabId: tab.id
            }, () => {
                if (chrome.runtime.lastError) {
                    console.log("[error] updateIcons", chrome.runtime.lastError.message);
                }
            });
        });
    });
}

function updateBadgesText(tabs) {
    console.log("updateBadgesText", tabs);
    tabs.forEach(tab => {
        chrome.browserAction.setBadgeText({
            text: (tabsArray.length).toString(),
            tabId: tab.id
        }, () => {
            if (chrome.runtime.lastError) { // if tab does not exists // todo debounce onclose event
                console.log("[error] updateBadgesText", chrome.runtime.lastError.message);
            }
        });
    });
}
