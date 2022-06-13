import {isOpera, logPicture} from "./util.js";
import {inIncognitoContext, exchangeMessage} from "./util-ext.js";
import {createBackgroundTab} from "./util-ext-bg.js";
import {openBookmarks} from "./bg/opera-bookmark-opener.js";

console.log("Popup...");
console.log(`Incognito: ${inIncognitoContext}.`);


const saveButton = document.querySelector("#btn-save-screen");
const changeIconButton = document.querySelector("#btn-change-icon");
const logScreenButton = document.querySelector("#btn-log-screen");
const visitButton = document.querySelector("#btn-visit");
const openVisitsButton = document.querySelector("#btn-open-visits");
const imageElem = document.querySelector("#image");

changeIconButton.addEventListener("click", () => {
	chrome.runtime.sendMessage("change-icon--message");
});

logScreenButton.addEventListener("click", async () => {
	const {screenshotUrl, tabUrl, tabTitle, date} = await exchangeMessage("take-screenshot--message-exchange");
	if (!screenshotUrl) {
		return;
	}
	logPicture(screenshotUrl);
	imageElem.src = screenshotUrl;
	imageElem.alt = tabTitle;
	imageElem.dataset.tabUrl = tabUrl;
	imageElem.dataset.date   = date;
	saveButton.removeAttribute("disabled");
});

saveButton.addEventListener("click", async () => {
	const dataUrl = imageElem.src;
	const tabUrl = imageElem.dataset.tabUrl;
	const response = await exchangeMessage({
		command: "save-screenshot--message-exchange",
		dataUrl,
		tabUrl,
	});
	console.log("save-screenshot--message-exchange response:", response);
	saveButton.classList.add("btn-outline-success");
});

visitButton.addEventListener("click", async () => {
	const visit = await exchangeMessage("add-visit--message-exchange");
	visitButton.classList.add("btn-outline-success");
	visitButton.title = visitToButtonTitle(visit);
});

openVisitsButton.addEventListener("click", async () => {
	createBackgroundTab(chrome.runtime.getURL("./list.html"));
});

;(async function() {
	const visit = await exchangeMessage("get-visit--message-exchange");
	if (visit) {
		visitButton.classList.add("btn-outline-success");
		visitButton.title = visitToButtonTitle(visit);
	}
})();

function visitToButtonTitle(visit) {
	return [visit.date].flat().map(ms => new Date(ms)).join("\n");
}

if (isOpera) {
	const openOperaBookmarks = document.querySelector("#open-opera-bookmarks");
	openOperaBookmarks.removeAttribute("hidden");
	openOperaBookmarks.addEventListener("click", () => {
		void openBookmarks();
	});
}
