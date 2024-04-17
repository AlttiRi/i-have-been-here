import {exchangeMessage} from "../../util-ext.js";
import {debounce} from "../../util.js";

declare global {
    var urls: string[];
    var tabs: chrome.tabs.Tab[];
}


const isListPage: boolean = location.pathname.endsWith("list.html");
const isJsonPage: boolean = location.pathname.endsWith("json.html");

let urls: string[] = [];

if (isListPage) {
    void renderTabList();
} else
if (isJsonPage) {
    void renderJson();
}

if (document.querySelector("#filters")) {
    let handler;
    if (isListPage) {
        handler = debounce(renderTabList, 500);
    } else {
        handler = debounce(renderUrlList, 500);
    }
    const onlyFilterElem:   HTMLInputElement = document.querySelector("#only-filter")!;
    const ignoreFilterElem: HTMLInputElement = document.querySelector("#ignore-filter")!;
    const state: URLSearchParams = new URLSearchParams(location.hash.slice(1));
    onlyFilterElem.value   = state.get("only")   || "";
    ignoreFilterElem.value = state.get("ignore") || "chrome-extension:// ";
    const pageBtn: HTMLAnchorElement  = document.querySelector(".nav-link.active")!;
    pageBtn.href = location.href;

    const saveState = (key: ("only" | "ignore"), value: string): void => {
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

    document.querySelector<HTMLButtonElement>("#copy-btn")!.addEventListener("click", () => {
        const text = globalThis.urls.join(" ");
        console.log(text);
        void navigator.clipboard.writeText(text);
    });

    document.querySelector<HTMLSpanElement>("#only-filter-text")!.addEventListener("contextmenu", event => {
        event.preventDefault();
        onlyFilterElem.value = "";
        saveState("only", "");
        handler();
    });
    document.querySelector<HTMLSpanElement>("#ignore-filter-text")!.addEventListener("contextmenu", event => {
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


function filterUrls(urls: string[]): string[] {
    const only:   string[] = document.querySelector<HTMLInputElement>("#only-filter")!.value.split(/\s+/).filter(o => o);
    const ignore: string[] = document.querySelector<HTMLInputElement>("#ignore-filter")!.value.split(/\s+/).filter(o => o);

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



async function renderUrlList() {
    const listElem: HTMLTableSectionElement = document.querySelector("#list-content")!;
    listElem.innerHTML = "";

    const _urls = filterUrls(urls);
    console.log(globalThis.urls = _urls);

    appendListByUrls(_urls, listElem);
}

function logTabs(tabs: chrome.tabs.Tab[]): void {
    console.log(globalThis.tabs = tabs);
    const isNonEmptySting = function (str: string | undefined): str is string { return Boolean(str); }
    globalThis.urls = tabs.map(tab => tab.url).filter(isNonEmptySting);
}

async function renderTabList(): Promise<void> {
    const tabs: chrome.tabs.Tab[] = await exchangeMessage("get-tabs--message-exchange");

    const listElem: HTMLTableSectionElement = document.querySelector("#list-content")!;
    listElem.innerHTML = "";

    const _tabs: chrome.tabs.Tab[] = tabs.filter(tab => {
        return tab.url && filterUrls([tab.url]).length;
    });

    logTabs(_tabs);

    appendListByTabs(_tabs, listElem);
}
async function renderJson(): Promise<void> {
    const tabs: chrome.tabs.Tab[] = await exchangeMessage("get-tabs--message-exchange");
    logTabs(tabs);

    const jsonElem: HTMLDivElement  = document.querySelector("#json-block")!;
    jsonElem.insertAdjacentHTML("afterbegin", `
        <div>
            <pre>${JSON.stringify(tabs, null, "   ")}</pre>
        </div>        
    `);
}



function appendListByTabs(tabs: chrome.tabs.Tab[], targetNode: Element): void {
    for (const tab of tabs) {
        const title: string = tab.title || "";
        targetNode.insertAdjacentHTML("beforeend", `
            <tr>
                <td>
                    <img class="favicon" src="${tab.favIconUrl || "/images/empty.png"}" alt=""/>
                    <a class="url link-primary" title="${title.replaceAll(`"`, "&quot;")}" href="${tab.url}" target="_blank" rel="noreferrer noopener">${tab.url}</a>
                </td>                
            </tr>
    `.replaceAll(/\s{2,}/g, ""));
    }
}

function appendListByUrls(urls: string[], targetNode: Element): void {
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


const listBlockElem: HTMLDivElement = document.querySelector("#list-block")!;
if (listBlockElem) {
    listBlockElem.addEventListener("click", event => {
        const target = event.target as Element;
        if (target.classList.contains("link-primary")) {
            target.closest("tr")!.classList.add("clicked");
        }
    });
    listBlockElem.addEventListener("mousedown", event => {
        const LEFT_BUTTON = 0;
        const MIDDLE_BUTTON = 1;
        const RIGHT_BUTTON = 2;
        if (event.button !== MIDDLE_BUTTON) {
            return;
        }
        const target = event.target as Element;
        if (target.classList.contains("favicon")) {
            target.closest("tr")!.classList.remove("clicked");
        }
    });
}
