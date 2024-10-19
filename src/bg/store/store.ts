import {TCRuleString, TitleCleaner} from "@alttiri/string-magic";
import {isFirefox, isOpera}      from "@/util";
import {ReactiveStoreLocalValue} from "@/bg/classes/reactive-store-local-value";


export const urlOpenerMode: ReactiveStoreLocalValue<"quickAccessUrlOpenerMode">
    = new ReactiveStoreLocalValue("quickAccessUrlOpenerMode", false);
export const dlShelf: ReactiveStoreLocalValue<"downloadShelf">
    = new ReactiveStoreLocalValue("downloadShelf", true);


const tcRSDefaultValue: TCRuleString[] = [
    "site:example.com",
      "trim-start: ☑ ✅ ",
      "trim-end:: - example",
      "trim-start-end: [ ]",
    "site:artstation.com",
      "trim-start:: ArtStation - ",
];

export const tcRuleStrings: ReactiveStoreLocalValue<"titleCleanerRuleStrings">
    = new ReactiveStoreLocalValue("titleCleanerRuleStrings", tcRSDefaultValue);

export const tcCompiledRules: ReactiveStoreLocalValue<"titleCleanerCompiledRules">
    = new ReactiveStoreLocalValue("titleCleanerCompiledRules", TitleCleaner.compileRuleStrings(tcRSDefaultValue));


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


export const commonSettings: ReactiveStoreLocalValue<"commonSettings">
    = new ReactiveStoreLocalValue("commonSettings", {
        browserName: "", // todo use the browser name
    });
