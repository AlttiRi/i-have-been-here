import {ReactiveStoreLocalValue} from "./reactive-store-local-value.js";
import {isFirefox, isOpera} from "../../util.js";

export const urlOpenerMode: ReactiveStoreLocalValue<boolean> =
    new ReactiveStoreLocalValue("quickAccessUrlOpenerMode", false);
export const dlShelf: ReactiveStoreLocalValue<boolean>
    = new ReactiveStoreLocalValue<boolean>("downloadShelf", true);

type TrimOption = {
    trimEnd?: String[],
    trimStart?: String[],
    trimStartEnd?: String[][],
};
type TrimOptionsObject = {
    [key: string]: TrimOption
};

const tcSettingsDefaultValue: TrimOptionsObject = {
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

export const tcSettings: ReactiveStoreLocalValue<TrimOptionsObject>
    = new ReactiveStoreLocalValue("titleCutterSettings", tcSettingsDefaultValue);


let quickAccessUrlDefaultValue: string = "chrome://bookmarks/";
if (isOpera) {
    quickAccessUrlDefaultValue = "chrome://startpage/bookmarks";
} else if (isFirefox) {
    quickAccessUrlDefaultValue = "";
}

export const quickAccessUrl: ReactiveStoreLocalValue<string>
    = new ReactiveStoreLocalValue("quickAccessUrl", quickAccessUrlDefaultValue);

export const filenameLengthLimit: ReactiveStoreLocalValue<number>
    = new ReactiveStoreLocalValue("filenameLengthLimit", 220);

