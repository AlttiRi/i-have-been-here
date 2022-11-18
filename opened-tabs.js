import {exchangeMessage} from "./util-ext.js";

if (["#list", "#json", "#input"].every(hash => hash !== location.hash)) {
    location.hash = "#list";
}

const jsonElem = document.querySelector(".json");
const listElem = document.querySelector(".list");
const btnClearElem  = document.querySelector("#clear");
const btnAppendElem = document.querySelector("#append");
const btnSetElem    = document.querySelector("#set");
const textInputElem = document.querySelector("#text-input");



void main();
async function main() {
    /** @type {chrome.tabs.Tab[]} */
    const tabs = await exchangeMessage("get-tabs--message-exchange");
    console.log(globalThis.tabs = tabs);

    jsonElem.insertAdjacentHTML("afterbegin", `
        <div>
            <pre>${JSON.stringify(tabs, null, "   ")}</pre>
        </div>        
    `);

    appendListByTabs(tabs);

    btnClearElem.addEventListener("click", event => {
        textInputElem.value = "";
        textInputElem.focus();
    });

    btnSetElem.addEventListener("click", event => {
        const urls = parseUrls(textInputElem.value);
        listElem.innerHTML = "";
        appendListByUrls(urls);
    });

    btnAppendElem.addEventListener("click", event => {
        const urls = parseUrls(textInputElem.value);
        appendListByUrls(urls);
    });
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

/** @param {chrome.tabs.Tab[]} tabs */
function appendListByTabs(tabs) {
    for (const tab of tabs) {
        listElem.insertAdjacentHTML("beforeend", `
            <tr>
                <td>
                    <img class="favicon" src="${tab.favIconUrl || "./images/empty.png"}" alt=""/>
                    <a class="url link-primary" href="${tab.url}" target="_blank" rel="noreferrer noopener">${tab.url}</a>
                </td>                
            </tr>
    `.replaceAll(/\s{2,}/g, ""));
    }
}

function appendListByUrls(urls) {
    for (const url of urls) {
        listElem.insertAdjacentHTML("beforeend", `
            <tr>
                <td>
                    <img class="favicon" src="./images/empty.png" alt=""/>
                    <a class="url link-primary" href="${url}" target="_blank" rel="noreferrer noopener">${url}</a>
                </td>                
            </tr>
    `.replaceAll(/\s{2,}/g, ""));
    }
}

