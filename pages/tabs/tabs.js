import {exchangeMessage} from "/util-ext.js";
import {debounce} from "../../util.js";

const isListPage  = location.pathname.endsWith("list.html");
const isJsonPage  = location.pathname.endsWith("json.html");
const isInputPage = location.pathname.endsWith("input.html");
if (isListPage) {
    void renderTabList();
} else
if (isJsonPage) {
    void renderJson();
} else
if (isInputPage) {
    handleInputControls();
}

if (document.querySelector("#filters")) {
    let handler;
    if (isListPage) {
        handler = debounce(renderTabList, 500);
    } else {
        //  ...
    }
    const onlyFilterElem = document.querySelector("#only-filter");
    const ignoreFilterElem = document.querySelector("#ignore-filter");
    const state = new URLSearchParams(location.hash.slice(1));
    onlyFilterElem.value   = state.get("only");
    ignoreFilterElem.value = state.get("ignore");
    const pageBtn = document.querySelector(".nav-link.active");
    pageBtn.href = location.href;

    function saveState(key, value) {
        state.set(key, value);
        location.hash = state.toString();
        pageBtn.href = location.href;
    }

    onlyFilterElem.addEventListener("input", () => {
        handler();
        saveState("only", onlyFilterElem.value);
    });
    ignoreFilterElem.addEventListener("input", () => {
        handler();
        saveState("ignore", ignoreFilterElem.value);
    });

    document.querySelector("#copy-btn").addEventListener("click", () => {
        const urls = [...document.querySelectorAll("#list-content a.url")].map(el => el.href);
        const text = urls.join("\n");
        console.log(text);
        void navigator.clipboard.writeText(text);
    });

    document.querySelector("#only-filter-text").addEventListener("contextmenu", event => {
        event.preventDefault();
        onlyFilterElem.value = "";
        saveState("only", "");
        handler();
    });
    document.querySelector("#ignore-filter-text").addEventListener("contextmenu", event => {
        event.preventDefault();
        ignoreFilterElem.value = "";
        saveState("ignore", "");
        handler();
    });
    pageBtn.addEventListener("contextmenu", event => {
        event.preventDefault();
        ignoreFilterElem.value = "";
        onlyFilterElem.value = ""
        saveState("ignore", "");
        saveState("only", "");
        handler();
    });
    pageBtn.addEventListener("click", () => {
        location.reload();
    });
}


function handleInputControls() {
    const textInputElem = document.querySelector("#text-input");

    const btnClearElem  = document.querySelector("#clear-btn");
    const btnAppendElem = document.querySelector("#append-btn");
    const btnSetElem    = document.querySelector("#set-btn");

    const listElem = document.querySelector("#list-content");

    btnClearElem.addEventListener("click", event => {
        textInputElem.value = "";
        listElem.innerHTML = "";
        textInputElem.focus();
    });
    btnSetElem.addEventListener("click", event => {
        const urls = parseUrls(textInputElem.value);
        listElem.innerHTML = "";
        appendListByUrls(urls, listElem);
    });
    btnAppendElem.addEventListener("click", event => {
        const urls = parseUrls(textInputElem.value);
        appendListByUrls(urls, listElem);
    });
}

function filterUrls(urls) {
    /** @type {String[]} */
    const only = document.querySelector("#only-filter").value.split(/\s+/).filter(o => o);
    /** @type {String[]} */
    const ignore = document.querySelector("#ignore-filter").value.split(/\s+/).filter(o => o);

    return urls.filter(url => {
        if (ignore.length && ignore.some(i => url.includes(i))) {
            return false;
        }
        if (only.length) {
            return only.some(o => url.includes(o));
        }
        return true;
    });
}

async function renderTabList() {
    /** @type {chrome.tabs.Tab[]} */
    const tabs = await exchangeMessage("get-tabs--message-exchange");
    console.log(globalThis.tabs = tabs);

    const listElem = document.querySelector("#list-content");
    listElem.innerHTML = "";

    appendListByTabs(tabs, listElem);
}
async function renderJson() {
    /** @type {chrome.tabs.Tab[]} */
    const tabs = await exchangeMessage("get-tabs--message-exchange");
    console.log(globalThis.tabs = tabs);

    const jsonElem = document.querySelector("#json-block");
    jsonElem.insertAdjacentHTML("afterbegin", `
        <div>
            <pre>${JSON.stringify(tabs, null, "   ")}</pre>
        </div>        
    `);
}


/** @param {chrome.tabs.Tab[]} tabs
 *  @param {Element} targetNode */
function appendListByTabs(tabs, targetNode) {
    for (const tab of tabs) {
        if (!filterUrls([tab.url]).length) {
            continue;
        }
        targetNode.insertAdjacentHTML("beforeend", `
            <tr>
                <td>
                    <img class="favicon" src="${tab.favIconUrl || "/images/empty.png"}" alt=""/>
                    <a class="url link-primary" href="${tab.url}" target="_blank" rel="noreferrer noopener">${tab.url}</a>
                </td>                
            </tr>
    `.replaceAll(/\s{2,}/g, ""));
    }
}
/** @param {String[]} urls
 *  @param {Element} targetNode */
function appendListByUrls(urls, targetNode) {
    for (const url of urls) {
        targetNode.insertAdjacentHTML("beforeend", `
            <tr>
                <td>
                    <img class="favicon" src="/images/empty.png" alt=""/>
                    <a class="url link-primary" href="${url}" target="_blank" rel="noreferrer noopener">${url}</a>
                </td>                
            </tr>
    `.replaceAll(/\s{2,}/g, ""));
    }
}

function parseUrls(urlsText) {
    const urls = urlsText.trim().split(/\s/);
    return urls.filter(u => u).map(url => {
        if (!url.includes("://")) {
            return "https://" + url;
        }
        if (url.startsWith("ttp")) {
            url = "h" + url;
        }
        return url;
    });
}
