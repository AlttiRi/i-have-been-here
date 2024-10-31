import {TCCompiledRules, TCRuleString} from "@alttiri/string-magic";
import {Base64, JpgDataURL} from "@/utils/util";

// Can be used with `ReactiveStoreLocalValue` instance
export type StoreLocalBase = {
    bookmarkOpenerMode:  boolean
    downloadShelf:       boolean
    filenameLengthLimit: number
    quickAccessUrl:      string
    quickAccessUrlOpenerMode: boolean
    commonSettings: {
        browserName:          string
        contentLogExtName:    boolean
        contentLogScreenshot: boolean
    }
    titleCleanerRuleStrings:   TCRuleString[]
    titleCleanerCompiledRules: TCCompiledRules
    // stateVersions: { // todo: 'stateVersions'
    //     visits:      number
    //     screenshots: number
    // }
}

// Use `getFromStoreLocal`, `setToStoreLocal` to work with them.
export type StoreLocalModel = {
    version: number // store version
    bgLoadingStartTime: number
    bgLoadingEndTime:   number
    bookmarks: Array<BookmarkURL | BookmarkFolder> | undefined
    visits: Visit[] | undefined
    screenshots: ScreenshotInfo[] | undefined
    [sc_id: ScreenshotDataId]: Base64
 // __json_name: "ihbh-extension-storage" // todo: use this value to mark the storage JSON
} & StoreLocalBase;

export type ScreenshotEntry = [ScreenshotDataId, StoreLocalModel[ScreenshotDataId]];


/**
 * "scd:" is just a prefix to group all properties.
 * An example of ScreenshotDataId is "scd:da39a3ee5e6b".
 * Here `da39a3ee5e6b` is an ID — a hash of the jpg file (the first 12 chars of SHA-1).
 */
export type ScreenshotDataId = `scd:${Lowercase<string>}`;

/** Any URL string. For example: "https://example.com/" */
export type URLString = string; // `${string}://${string}`;

/** A saved screenshot information. */
export type ScreenshotInfo = {
    scd_id: ScreenshotDataId,
    url: URLString,
    title: string,
    created: number,
};

/** A captured screenshot data */
export type TabCapture = {
    tab: chrome.tabs.Tab/* & {url: string} */,
    screenshotUrl: JpgDataURL,
    date: number,
};

/**
 * Like a bookmark, but simpler.
 * Just to mark a page that it was visited.
 */
export type Visit = { // todo add id
    url: URLString,
    title: string,
    created: number,
    lastVisited?: number,
};

export type Bookmark = {
    type: "folder" | "url",
    id: number,
    p_id: number,
    created: number,
    comment?: string,
};

export type BookmarkURL = {
    type: "url",
    title: string,
    url: URLString,
    scd_id?: ScreenshotDataId,
    lastVisited?: number,
} & Bookmark;

export type BookmarkFolder = {
    type: "folder",
    name: string,
} & Bookmark;


export type NewTabInfo = {
    url: string,
    reload?: boolean,
};
