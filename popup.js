import {logPicture} from "./util.js";
import {inIncognitoContext, exchangeMessage} from "./util-ext.js";

console.log("Popup...");
console.log(`Incognito: ${inIncognitoContext}.`);


const saveButton = document.querySelector("#btn-save-screen");
const changeIconButton = document.querySelector("#btn-change-icon");
const logScreenButton = document.querySelector("#btn-log-screen");
const visitedButton = document.querySelector("#btn-visited");
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

visitedButton.addEventListener("click", async () => {
	const response = await exchangeMessage("add-visited--message-exchange");
	visitedButton.classList.add("btn-outline-success");
	visitedButton.title = response;
});

;(async function() {
	const response = await exchangeMessage("is-visited--message-exchange");
	if (response) {
		visitedButton.classList.add("btn-outline-success");
		visitedButton.title = response;
	}
})();
