import {ReactiveStoreLocalValue} from "./reactive-store-local-value";
import {isFirefox, isOpera} from "@/util";

export const urlOpenerMode: ReactiveStoreLocalValue<"quickAccessUrlOpenerMode">
    = new ReactiveStoreLocalValue("quickAccessUrlOpenerMode", false);
export const dlShelf: ReactiveStoreLocalValue<"downloadShelf">
    = new ReactiveStoreLocalValue("downloadShelf", true);

export type TrimOptions = {
    trimEnd?: string[],
    trimStart?: string[],
    trimStartEnd?: string[][],
};
type hostname = string;
export type TrimConfig = {
    [key: hostname]: TrimOptions
};

const ttConfigDefaultValue: TrimConfig = {
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

export const ttConfig: ReactiveStoreLocalValue<"titleTrimmerConfig">
    = new ReactiveStoreLocalValue("titleTrimmerConfig", ttConfigDefaultValue);


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

