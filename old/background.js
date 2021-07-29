import {extensionName} from "../util.js";

console.log(`[${extensionName}] background.js loaded`);



// let i = 0;
// chrome.browserAction.onClicked.addListener(function(tab) {
//     console.log("chrome.browserAction.onClicked", tab);
//
//     i++;
//     chrome.browserAction.setPopup({
//         popup: i % 2 === 0 ? "options.html": "popup.html"
//     });
//
//     //chrome.runtime.reload();
// });


// chrome.browserAction.setPopup({
//     popup: "options.html"
// });