import {getActiveTab}        from "../util-ext-bg.js";
import {dateToDayDateString} from "../util.js";
import {updateIcons} from "./tab-counter.js";

const messageTextAdd = "add-visited";
const messageTextIs  = "is-visited";


export function visitedBtnHandler() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message !== messageTextAdd) {
            return;
        }
        asyncHandler(sendResponse).then(/*nothing*/);
        return true;
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message !== messageTextIs) {
            return;
        }
        takeVisited(sendResponse).then(/*nothing*/);
        return true;
    });
}

export async function getAllVisitUrls() {
    const urlsObject = await getVisits()
    return Object.keys(urlsObject);
}

async function getVisits() {
    const key = "visited";
    const urlsObject = await new Promise(resolve => {
        chrome.storage.local.get([key], (res) => {
            resolve(res[key]);
        });
    }) || {};
    return urlsObject;
}
async function getVisitsForActiveTabUrl() {
    const tab = await getActiveTab();
    if (!tab) {
        console.log("[warning] no active tab available");
        return;
    }
    const urlsObject = await getVisits();
    const url = tab.url;
    const visits = urlsObject[url] || [];
    return {visits, url, urlsObject};
}

async function updateVisits({visits, urlsObject, url}) {
    const key = "visited";
    Object.assign(urlsObject, {[url]: visits});
    await new Promise(resolve => {
        chrome.storage.local.set({[key]: urlsObject}, () => resolve());
    });
}

async function takeVisited(sendResponse) {
    const {visits} = await getVisitsForActiveTabUrl();

    const str = visits.join("\n");
    sendResponse(str);
}

async function asyncHandler(sendResponse) {
    const date = dateToDayDateString(new Date());

    const {visits, urlsObject, url} = await getVisitsForActiveTabUrl();

    if (!visits.includes(date)) {
        visits.push(date);
        await updateVisits({visits, urlsObject, url});
        const tab = await getActiveTab();
        await updateIcons([tab]);
    }

    // await new Promise(resolve => { chrome.storage.local.remove([key], () => resolve()); });

    const str = visits.join("\n");
    sendResponse(str);
}
