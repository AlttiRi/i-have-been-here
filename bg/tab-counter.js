// Count tabs with separation for incognito and normal mode
// + changes icon

import {queryTabs} from "../util-ext-bg.js";
import {getAllVisitUrls} from "./visited.js";
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

    //todo if closed multiple tabs
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
        console.log("delete", tabId, removeInfo);
        tabsArray.splice(tabsArray.indexOf(tabsArray.find(tab => tab.id === tabId)) , 1);

        updateBadgesText(tabsArray);
    });

    chrome.windows.onFocusChanged.addListener((windowId, filters) => {
        console.log("onFocusChanged", windowId);
        if (windowId !== chrome.windows.WINDOW_ID_NONE) {
            setDefaultIcon(imgPath);
        }
    });
}



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
        // todo refactor: some code related only to visited.js
        Store.bookmarkOpenerMode.onValue(async (bom) => {
            if (bom) {
                chrome.browserAction.setIcon({
                    path: imgPath,
                    tabId: tab.id
                });
                return;
            }
            const visits = await getAllVisitUrls();
            if (visits.includes(tab.url)) {
                chrome.browserAction.setIcon({
                    // imageData: emojiToImageData("✅"),
                    path: chrome.runtime.getURL("images/mark.png"),
                    tabId: tab.id
                });
            }
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
                console.log("updateBadgesText", chrome.runtime.lastError.message);
            }
        });
    });
}
