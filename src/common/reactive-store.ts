import {TCRuleString, TitleCleaner} from "@alttiri/string-magic";
import {browserName, isFirefox, isOpera} from "@/utils/util";
import {ReactiveStoreLocalValue} from "@/common/classes/reactive-store-local-value";
import {StoreLocalBase}          from "@/common/types";


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


export const commonSettingsDefault: StoreLocalBase["commonSettings"] = {
    browserName,
    contentLogExtName:    true,
    contentLogScreenshot: true,
};

export const commonSettings: ReactiveStoreLocalValue<"commonSettings">
    = new ReactiveStoreLocalValue("commonSettings", commonSettingsDefault);

// todo: 'stateVersions'
// export const stateVersionsDefault: StoreLocalBase["stateVersions"] = {
//     visits:      0,
//     screenshots: 0,
// };
//
// export const stateVersions: ReactiveStoreLocalValue<"stateVersions">
//     = new ReactiveStoreLocalValue("stateVersions", stateVersionsDefault);
