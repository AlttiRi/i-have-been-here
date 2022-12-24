import {inIncognitoContext} from "/util-ext.js";

console.log("Popup...");
console.log(`Incognito: ${inIncognitoContext}.`);

import "./popup-screenshot.js";
import "./popup-visits.js";
import "./popup-other.js";
