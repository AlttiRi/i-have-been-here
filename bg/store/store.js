import {ReactiveStoreLocalValue} from "./reactive-store-local-value.js";
import {isFirefox, isOpera} from "../../util.js";

/** @type {ReactiveStoreLocalValue<Boolean>} */
export const bom = new ReactiveStoreLocalValue("bookmarkOpenerMode", false);

/** @type {ReactiveStoreLocalValue<Boolean>} */
export const dlShelf = new ReactiveStoreLocalValue("downloadShelf", true);


/** @typedef {Object<String, {
 * trimEnd?: String[],
 * trimStart?: String[],
 * trimStartEnd?: String[][],
 * }>} TCSettings */

/** @type {TCSettings} */
const tcSettingsDefaultValue = {
    "example.com": {
        "trimEnd": [" - example"],
        "trimStart": ["☑", "✅"],
        "trimStartEnd": [
            ["[", "]"]
        ]
    },
    "www.artstation.com": {
        "trimStart": ["ArtStation - "]
    }
};

/** @type {ReactiveStoreLocalValue<TCSettings>} */
export const tcSettings = new ReactiveStoreLocalValue("titleCutterSettings", tcSettingsDefaultValue);


let quickAccessUrlDefaultValue = "chrome://bookmarks/";
if (isOpera) {
    quickAccessUrlDefaultValue = "chrome://startpage/bookmarks";
} else if (isFirefox) {
    quickAccessUrlDefaultValue = "";
}
/** @type {ReactiveStoreLocalValue<String>} */
export const quickAccessUrl = new ReactiveStoreLocalValue("quickAccessUrl", quickAccessUrlDefaultValue);

/** @type {ReactiveStoreLocalValue<String>} */
export const filenameLengthLimit = new ReactiveStoreLocalValue("filenameLengthLimit", 220);

