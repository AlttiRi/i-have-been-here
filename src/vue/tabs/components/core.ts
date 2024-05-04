import {ref, watchEffect} from "vue";


export const state: URLSearchParams = new URLSearchParams(location.hash.slice(1));
export const saveState = (key: ("only" | "ignore"), value: string): void => {
    state.set(key, value);
    location.hash = state.toString();
}

export const onlyFilter   = ref(state.get("only")   || "");
export const ignoreFilter = ref(state.get("ignore") || "-extension://"); // moz-extension:// chrome-extension://


watchEffect(() => {
    saveState("only", onlyFilter.value);
});
watchEffect(() => {
    saveState("ignore", ignoreFilter.value);
});


export function filterUrls(urls: string[]): string[] {
    const only:   string[] = onlyFilter.value.split(/\s+/).filter(o => o);
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
    console.log(tabs);
    globalThis.__tabs = tabs
    globalThis.__urls = tabs.map(tab => tab.url).filter(isNonEmptySting);
}
