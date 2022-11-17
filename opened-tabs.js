import {exchangeMessage} from "./util-ext.js";

if (["#list", "#json", "#input"].every(hash => hash !== location.hash)) {
    location.hash = "#list";
}

const jsonElem = document.querySelector(".json");
const listElem = document.querySelector(".list");
const btnClearElem  = document.querySelector("#clear");
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

    for (const tab of tabs) {
        listElem.insertAdjacentHTML("beforeend", `
            <div>
                <img class="favicon" src="${tab.favIconUrl || "./images/empty.png"}" alt=""/>
                <a class="url" href="${tab.url}" target="_blank" rel="noreferrer noopener">${tab.url}</a>
            </div>
    `.replaceAll(/\s{2,}/g, ""));
    }

    btnClearElem.addEventListener("click", event => {
        textInputElem.value = "";
        textInputElem.focus();
    });
}
