import {exchangeMessage} from "/util-ext.js";


if (location.pathname.endsWith("list.html")) {
    void renderTabList();
} else
if (location.pathname.endsWith("json.html")) {
    void renderJson();
} else
if (location.pathname.endsWith("input.html")) {
    handleInputControls();
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


async function renderTabList() {
    /** @type {chrome.tabs.Tab[]} */
    const tabs = await exchangeMessage("get-tabs--message-exchange");
    console.log(globalThis.tabs = tabs);

    const listElem = document.querySelector("#list-content");
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
