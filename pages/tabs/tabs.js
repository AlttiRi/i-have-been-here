import {exchangeMessage} from "/util-ext.js";
import {debounce} from "../../util.js";

const isListPage  = location.pathname.endsWith("list.html");
const isJsonPage  = location.pathname.endsWith("json.html");
const isInputPage = location.pathname.endsWith("input.html");

let urls = [];

if (isListPage) {
    void renderTabList();
} else
if (isJsonPage) {
    void renderJson();
} else
if (isInputPage) {
    void renderUrlList();
}

if (document.querySelector("#filters")) {
    let handler;
    if (isListPage) {
        handler = debounce(renderTabList, 500);
    } else {
        handler = debounce(renderUrlList, 500);
    }
    const onlyFilterElem = document.querySelector("#only-filter");
    const ignoreFilterElem = document.querySelector("#ignore-filter");
    const state = new URLSearchParams(location.hash.slice(1));
    onlyFilterElem.value   = state.get("only");
    ignoreFilterElem.value = state.get("ignore") || "chrome-extension:// ";
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


if (document.querySelector("#input-block")) {
    const textInputElem = document.querySelector("#text-input");

    const btnAppendElem = document.querySelector("#append-btn");
    const btnSetElem    = document.querySelector("#set-btn");
    const btnClearElem  = document.querySelector("#clear-btn");

    btnSetElem.addEventListener("click", event => {
        urls = parseUrls(textInputElem.value);
        void renderUrlList();
    });
    btnAppendElem.addEventListener("click", event => {
        urls = [...urls, ...parseUrls(textInputElem.value)];
        void renderUrlList();
    });
    btnClearElem.addEventListener("click", event => {
        textInputElem.value = "";
        textInputElem.focus();
        urls = [];
        void renderUrlList();
    });
}

async function renderUrlList() {
    const listElem = document.querySelector("#list-content");
    listElem.innerHTML = "";

    const _urls = filterUrls(urls);
    console.log(globalThis.urls = _urls);

    appendListByUrls(_urls, listElem);
}

/** @param {chrome.tabs.Tab[]} tabs */
function logTabs(tabs) {
    console.log(globalThis.tabs = tabs);
    globalThis.urls = tabs.map(tab => tab.url);
}

async function renderTabList() {
    /** @type {chrome.tabs.Tab[]} */
    const tabs = await exchangeMessage("get-tabs--message-exchange");

    const listElem = document.querySelector("#list-content");
    listElem.innerHTML = "";

    const _tabs = tabs.filter(tab => {
        return filterUrls([tab.url]).length;
    });

    logTabs(_tabs);

    appendListByTabs(_tabs, listElem);
}
async function renderJson() {
    /** @type {chrome.tabs.Tab[]} */
    const tabs = await exchangeMessage("get-tabs--message-exchange");
    logTabs(tabs);

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
        if (!url.includes(":")) {
            return "https://" + url;
        }
        if (url.startsWith("ttp")) {
            url = "h" + url;
        }
        return url;
    });
}

const listBlockElem = document.querySelector("#list-block");
listBlockElem.addEventListener("click", event => {
    if (event.target.classList.contains("link-primary")) {
        event.target.closest("tr").classList.add("clicked");
    }
});
listBlockElem.addEventListener("mousedown", event => {
    const LEFT_BUTTON = 0;
    const MIDDLE_BUTTON = 1;
    const RIGHT_BUTTON = 2;
    if (event.button !== MIDDLE_BUTTON) {
        return;
    }
    if (event.target.classList.contains("favicon")) {
        event.target.closest("tr").classList.remove("clicked");
    }
});
