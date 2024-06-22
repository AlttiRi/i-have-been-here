import {Base64} from "@/util";
import {TCCompiledRules, TCRuleString} from "@/title-cleaner";

export type StoreLocalBase = {
    bookmarkOpenerMode: boolean,
    downloadShelf: boolean,
    filenameLengthLimit: number,
    quickAccessUrl: string,
    quickAccessUrlOpenerMode: boolean,
    titleCleanerRuleStrings:   TCRuleString[],
    titleCleanerCompiledRules: TCCompiledRules,
    version: number,
}

export type StoreLocalModel = {
    bookmarks: Array<BookmarkURL | BookmarkFolder> | undefined,
    visits: Visit[] | undefined,
    screenshots: ScreenshotInfo[] | undefined,
    [sc_id: ScreenshotDataId]: Base64,
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
