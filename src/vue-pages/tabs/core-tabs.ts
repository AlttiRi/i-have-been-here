import {ref, toRaw, watch} from "vue";
import {NavigationFailure} from "vue-router";
import {setHash} from "@/vue-pages/header/router";


const state: URLSearchParams = new URLSearchParams();
const saveState = (key: ("only" | "ignore"), value: string): Promise<void | NavigationFailure> => {
    state.set(key, value);
    if (!value /*&& key === "only"*/) {
        state.delete(key);
    }
    return updateHash();
}

export const onlyFilter   = ref("");
export const ignoreFilter = ref("");
export function updateHash() {
    return setHash(decodeURIComponent(state.toString()));
}
// todo: add to settings
export const defaultIgnore = "extension:// chrome://"; // moz-extension:// chrome-extension://

watch(onlyFilter, () => {
    void saveState("only", onlyFilter.value);
});
watch(ignoreFilter, () => {
    void saveState("ignore", ignoreFilter.value);
});


export function filterUrls(urls: string[]): string[] {
    const only:   string[] =   onlyFilter.value.split(/\s+/).filter(o => o);
    const ignore: string[] = ignoreFilter.value.split(/\s+/).filter(o => o);

    return urls.filter(url => {
        if (ignore.length && ignore.some(i => url.includes(i))) {
            return false;
        }
        if (only.length) {
            return only.some(o => url.includes(o));
        }
        return true;
    });
}

// just only for ts
const isNonEmptySting = function (str: string | undefined): str is string { return Boolean(str); }
declare global {
    var __urls: string[];
    var __tabs: chrome.tabs.Tab[];
}
export function logTabs(tabs: chrome.tabs.Tab[]): void {
    console.log(toRaw(tabs));
    globalThis.__tabs = tabs;
    globalThis.__urls = tabs.map(tab => tab.url).filter(isNonEmptySting);
}
