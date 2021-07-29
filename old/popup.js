import {createBackgroundTab, focusOrCreateNewTab, queryTabs, openOptions} from "../util.js"

const extensionName = chrome.i18n.getMessage("extension_name");
const text = document.querySelector("#text");
text.innerHTML = location.href + " " + extensionName;

const btn1 = document.querySelector("#create-tab-btn");
const btn2 = document.querySelector("#focus-tab-btn");
const btn3 = document.querySelector("#log-info-btn");
const btn4 = document.querySelector("#open-options");
const reloadBtn = document.querySelector("#reload");

const optionsUrl = chrome.runtime.getURL("options.html");
const popupUrl = chrome.runtime.getURL("popup.html");

btn1.addEventListener("click", () => {
	createBackgroundTab(popupUrl);
});

btn2.addEventListener("click", () => {
	focusOrCreateNewTab(popupUrl).then(/*Nothing*/);
});

btn3.addEventListener("click", async () => {
	const tabs = await queryTabs();
	console.log(tabs);
});



reloadBtn.addEventListener("click", () => {
	chrome.runtime.reload();
});

btn4.addEventListener("click", () => {
	openOptions(true);
});
