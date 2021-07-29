import {inIncognitoContext, logPicture, sendMessage} from "./util.js";

console.log("popup...");
console.log(`Incognito: ${inIncognitoContext}.`);


const btn1 = document.querySelector("#btn-change-icon");
btn1.addEventListener("click", () => {
	chrome.runtime.sendMessage("change-icon");
});


const btn2 = document.querySelector("#btn-log-screen");
btn2.addEventListener("click", async () => {
	const response = await sendMessage("take-screenshot");
	logPicture(response.screenshotUrl);
	document.querySelector("#image").src = response.screenshotUrl;
});

const btn3 = document.querySelector("#btn-visited");
btn3.addEventListener("click", async () => {
	const response = await sendMessage("add-visited");
	btn3.classList.add("btn-outline-success");
	btn3.title = response;
});

;(async function () {
	const response = await sendMessage("is-visited");
	if (response) {
		btn3.classList.add("btn-outline-success");
		btn3.title = response;
	}
})();
