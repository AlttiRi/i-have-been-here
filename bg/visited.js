import {getActiveTab}        from "../util-ext-bg.js";
import {dateToDayDateString} from "../util.js";
import {updateIcons} from "./tab-counter.js";
import {getFromStoreLocal, setToStoreLocal} from "../util-ext.js";
import {ComputedProperty, ObservableProperty, ObservableStoreLocalProperty} from "./ObservableProperies.js";

const messageTextAdd = "add-visited";
const messageTextIs  = "is-visited";


export function visitedBtnHandler() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message === messageTextAdd) {
            void asyncHandler(sendResponse);
            return true;
        } else
        if (message === messageTextIs) {
            void takeVisited(sendResponse);
            return true;
        }
    });
}

// todo?
// /** @type {ObservableStoreLocalProperty} */
// const visits = new ObservableStoreLocalProperty("visited", {});
// /** @type {ComputedProperty} */
// export const allVisitedUrls = new ComputedProperty(visits, visitsValue => {
//     return Object.keys(visitsValue);
// });

export async function getAllVisitUrls() {
    const urlsObject = await getVisits()
    return Object.keys(urlsObject);
}

async function getVisits() {
    return await getFromStoreLocal("visited") || {};
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
    Object.assign(urlsObject, {[url]: visits});
    await setToStoreLocal("visited", urlsObject);
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
