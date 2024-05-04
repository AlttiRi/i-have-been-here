import {ReactiveStoreLocalValue} from "./reactive-store-local-value";
import {isFirefox, isOpera} from "@/util";

export const urlOpenerMode: ReactiveStoreLocalValue<"quickAccessUrlOpenerMode">
    = new ReactiveStoreLocalValue("quickAccessUrlOpenerMode", false);
export const dlShelf: ReactiveStoreLocalValue<"downloadShelf">
    = new ReactiveStoreLocalValue("downloadShelf", true);

export type TrimOption = {
    trimEnd?: string[],
    trimStart?: string[],
    trimStartEnd?: string[][],
};
export type TrimOptionsObject = {
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

export const tcSettings: ReactiveStoreLocalValue<"titleCutterSettings">
    = new ReactiveStoreLocalValue("titleCutterSettings", tcSettingsDefaultValue);


let quickAccessUrlDefaultValue: string = "chrome://bookmarks/";
if (isOpera) {
    quickAccessUrlDefaultValue = "chrome://startpage/bookmarks";
} else if (isFirefox) {
    quickAccessUrlDefaultValue = "";
}

export const quickAccessUrl: ReactiveStoreLocalValue<"quickAccessUrl">
    = new ReactiveStoreLocalValue("quickAccessUrl", quickAccessUrlDefaultValue);

export const filenameLengthLimit: ReactiveStoreLocalValue<"filenameLengthLimit">
    = new ReactiveStoreLocalValue("filenameLengthLimit", 220);

