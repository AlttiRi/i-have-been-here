import {initControls, initHomeBtn} from "./popup-0-other.js";
import {initPreview, updatePreview} from "./popup-3-screenshot.js";
import {initVisits} from "./popup-2-visits.js";
import {inIncognitoContext} from "../util-ext.js";

console.log("[Popup] Incognito:", inIncognitoContext);

;(async function main(): Promise<void> {
    initControls();
    void updatePreview();
    void initHomeBtn();
    void initPreview();
    void initVisits();
})();
