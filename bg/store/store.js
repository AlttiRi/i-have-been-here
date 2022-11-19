import {ReactiveStoreLocalValue} from "./reactive-store-local-value.js";

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
const defaultValue = {
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
export const tcSettings = new ReactiveStoreLocalValue("titleCutterSettings", defaultValue);
