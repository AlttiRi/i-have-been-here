import {downloadBlob, logPicture, sleep} from "/util.js";
import {exchangeMessage,inIncognitoContext} from "/util-ext.js";
import {createBackgroundTab} from "/util-ext-bg.js";
import {openQuickAccessUrl} from "/bg/quick-access-url-opener.js";
import {getActiveTabData} from "/bg/log-image.js";
import {quickAccessUrl} from "/bg/store/store.js";
import {getScreenshotFilename, getTrimmedTitle} from "./popup-util.js";

console.log("Popup...");
console.log(`Incognito: ${inIncognitoContext}.`);


const saveButton = document.querySelector("#btn-save-screen");
const visitButton = document.querySelector("#btn-visit");
const openVisitsButton = document.querySelector("#btn-open-visits");
const downloadButton = document.querySelector("#btn-download-screenshot");
const imageElem = document.querySelector("#image");
const faviconElem = document.querySelector("#favicon");
const titleElem = document.querySelector("#title");
const urlElem = document.querySelector("#url");


/**
 * @type {{
 *     url, title, favIconUrl, screenshotUrl, date,
 *     id, incognito, height, width
 * }}
 */
let screenShotData;
async function initPreview() {
	screenShotData = await getActiveTabData();
	const {
		url, title, favIconUrl, screenshotUrl, date,
	 /* id, incognito, height, width */
	} = screenShotData;

	if (!screenshotUrl) {
		return;
	}

	faviconElem.title = favIconUrl;
	if (favIconUrl === undefined) {
		faviconElem.src = "/images/empty.png";
	} else
	if (favIconUrl.startsWith("data:")) {
		faviconElem.src = favIconUrl;
		faviconElem.title = favIconUrl.slice(0, 60) + (favIconUrl.length > 60 ? "…" : "");
	} else {
		faviconElem.src = "chrome://favicon/size/16@2x/" + url;
	}

	const trimmedTitle = await getTrimmedTitle(title, url);
	titleElem.textContent = trimmedTitle.length > 3 ? trimmedTitle : title;
	titleElem.title = titleElem.textContent;
	const u = new URL(url);
	if (u.protocol.startsWith("http")) {
		urlElem.textContent = u.host.replace(/^www./, "");
	} else {
		urlElem.textContent = u.href;
	}

	// urlElem.dataset.url = url;
	urlElem.title = url;

	logPicture(screenshotUrl);
	imageElem.src = screenshotUrl;
	imageElem.alt = "";
	imageElem.dataset.tabUrl = url;
	imageElem.dataset.date   = date;
	saveButton.removeAttribute("disabled");

	// Tor's popup's scroll fix
	await sleep(20);
	imageElem.alt = "";
}
void initPreview();

imageElem.addEventListener("mousedown", async () => {
	await exchangeMessage("take-screenshot--message-exchange"); // just to log the image in bg
	return initPreview();
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
	createBackgroundTab(chrome.runtime.getURL("/pages/visits.html"));
});

downloadButton.addEventListener("click", async () => {
	const {
		url, screenshotUrl, title
	} = screenShotData;
	const resp = await fetch(screenshotUrl);
	const blob = await resp.blob();

	const name = await getScreenshotFilename(url, title);
	downloadBlob(blob, name, url);

	downloadButton.classList.add("btn-outline-success");
	chrome.runtime.sendMessage("change-icon--message");
	await sleep(500);
	downloadButton.classList.remove("btn-outline-success");
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

;(async function() {
	const quickAccessUrlValue = await quickAccessUrl.getValue();
	if (!quickAccessUrlValue) {
		return;
	}
	const openQuickAccessUrlElem = document.querySelector("#open-quick-access-url");
	openQuickAccessUrlElem.title = quickAccessUrlValue;
	openQuickAccessUrlElem.removeAttribute("hidden");
	openQuickAccessUrlElem.addEventListener("click", () => {
		void openQuickAccessUrl();
	});
})();

