import {ReactiveStoreLocalValue} from "./value.js";

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
