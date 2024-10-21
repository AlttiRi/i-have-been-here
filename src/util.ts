declare global {
    interface Window {
        opr: undefined | object;
    }
    function logPicture(url: string, scale: number): void
}

export const isFirefox: boolean = typeof navigator === "object" && navigator.userAgent.includes("Firefox");
export const isOpera:   boolean = typeof navigator === "object" && navigator.userAgent.includes("OPR") || typeof window === "object" && typeof window.opr !== "undefined";


export async function logPicture(url: string, scale: number = 0.5): Promise<void> {
    let imgSrc: string;
    if (isBlobUrl(url)) {
        imgSrc = await blobUrlToDataUrl(url);
    } else {
        imgSrc = url;
    }

    const img: HTMLImageElement = new Image();
    const imageLoaded: Promise<Event> = new Promise(resolve => img.onload = resolve);
    img.src = imgSrc;
    await imageLoaded;

    console.log("%c ", `
       padding: ${Math.floor(img.height * scale / 2)}px ${Math.floor(img.width * scale / 2)}px;
       background: url("${img.src}");
       background-size: ${img.width * scale}px ${img.height * scale}px;
       font-size: 0;
    `);
}
globalThis.logPicture = logPicture;

async function blobUrlToDataUrl(blobUrl: BlobURL): Promise<DataURL> {
    const response = await fetch(blobUrl);
    const blob = await response.blob()
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (_event: ProgressEvent<FileReader>) => resolve(reader.result as DataURL);
        reader.readAsDataURL(blob);
    });
}

function isBlobUrl(url: string): url is BlobURL {
    return url.toString().startsWith("blob:");
}


export function emojiToImageData(emoji: string, size = 64, multiplier = 1): ImageData {
    const {context} = emojiTo(emoji, size, multiplier);
    return context.getImageData(0, 0, size, size);
}

// very slow (~1 second)
export function emojiToBlob(emoji: string, size?: number, multiplier?: number): Promise<Blob> {
    const {canvas} = emojiTo(emoji, size, multiplier);
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob: (Blob | null)) => { // this is slow
            if (blob) {
                resolve(blob);
            } else {
                reject();
            }
        });
    });
}

export type DataURLTyped<type extends string> = `data:${type};base64${string}`;
export type DataURL    = DataURLTyped<string>;
export type PngDataURL = DataURLTyped<"image/png">;
export type JpgDataURL = DataURLTyped<"image/jpeg">;
export type BlobURL = `blob:${string}`;
export type BinaryString = string;
export type Base64  = string;
export type TextURL = string;

export function toHex(ab: ArrayBuffer): Lowercase<string> {
    return [...new Uint8Array(ab)].map(b => b.toString(16).padStart(2, "0")).join("") as Lowercase<string>;
}

export function emojiToDataURL(emoji: string, size?: number, multiplier?: number): PngDataURL {
    const {canvas} = emojiTo(emoji, size, multiplier);
    return canvas.toDataURL("png", 100) as PngDataURL;
}
export async function emojiToBlobURL(emoji: string, size?: number, multiplier?: number, revokeDelay = 100000): Promise<BlobURL> {
    const blob = await emojiToBlob(emoji, size, multiplier);
    const url = URL.createObjectURL(blob) as BlobURL;
    setTimeout(() => URL.revokeObjectURL(url), revokeDelay);
    return url;
}


type CanvasContext2D = {
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
};

function emojiTo(emoji = "⬜", size = 64, multiplier = 1.01): CanvasContext2D {

    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width  = size;
    canvas.height = size;
    const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!context) {
        throw new Error("[emojiTo] CanvasRenderingContext2D is null");
    }

    context.font = size * 0.875 * multiplier + "px serif";
    context.textBaseline = "middle";
    context.textAlign = "center";

    const x = size / 2;
    const y = size / 2 + Math.round(size - size * 0.925);
    context.fillText(emoji, x, y);

    return {canvas, context};
}


export class LS {
    static getItem<T>(name: string, defaultValue: T): T {
        const value: string | null = localStorage.getItem(name);
        if (value === null) {
            LS.setItem(name, defaultValue);
            return defaultValue;
        }
        return JSON.parse(value);
    }
    static setItem(name: string, value: any): void {
        localStorage.setItem(name, JSON.stringify(value));
    }
    static removeItem(name: string): void {
        localStorage.removeItem(name);
    }
    static pushItem<T>(name: string, value: T): void {
        const array: T[] = LS.getItem(name, []);
        array.push(value);
        LS.setItem(name, array);
    }
    static popItem<T>(name: string, value: T): void {
        const array: T[] = LS.getItem(name, []);
        const index: number = array.indexOf(value);
        if (index !== -1) {
            array.splice(index, 1);
            LS.setItem(name, array);
        }
    }
}

export function binaryStringToArrayBuffer(binaryString: BinaryString): Uint8Array {
    const u8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        u8Array[i] = binaryString.charCodeAt(i);
    }
    return u8Array;
}


// todo? escape ~ in chrome
//  do not unescape `%0A`, for example
const defaultEncodeMap: Map<string, string> = new Map([
    // [ " ",   "+"],
    [ " ", "%20"],
    ["\"", "%22"],
    // [ "#", "%23"],
    // [ "+", "%2B"],
    [ "/", "%2F"],
    [ "*", "%30"],
    [ ":", "%3A"],
    [ "<", "%3C"],
    [ ">", "%3E"],
    [ "?", "%3F"],
    ["\\", "%5C"],
    [ "|", "%7C"],
    // [ "~", "%7E"], // Since Chrome replaces `~` with `_` on file downloading // todo: option
    // [ "·", "%C2%B7"],
]);
function getEncoder(replacingArray: Array<Array<string>>) {
    const map = new Map(defaultEncodeMap);
    for (const [a, b] of replacingArray) {
        map.set(a, b);
    }
    const regexp = new RegExp("[" + [...map.keys()].join("") + "]", "g");
    return function(name: string) {
        return name.replaceAll(regexp, ch => map.get(ch) ?? ch);
    }
}

const encodeSearch = getEncoder([["#", "%23"], ["·", "%C2%B7"]]);
const encodeHash   = getEncoder([["/",   "·"], ["·", "%C2%B7"]]);
const encodePath   = getEncoder([["#", "%23"], ["·", "%C2%B7"]]);

export function fullUrlToFilename(url: string): string {
    const u = new URL(url);
    const pathnameNorm = u.pathname.replaceAll(/\/+/g, "/");
    const pt = pathnameNorm.startsWith("/") ? pathnameNorm.slice(1) : pathnameNorm;
    let main = [u.hostname, ...pt.split("/")].filter(o => o);
    main = main.map(o => encodePath(decodeURIComponent(o)));
    let header;
    if (u.protocol.startsWith("http")) {
        const hostname = u.hostname.startsWith("www.") ? u.hostname.slice(4) : u.hostname;
        header = `[${hostname}]`;
        main = main.slice(1);
    } else
    if (u.protocol === "file:") {
        const diskLetter = main.length && main[0].match(/^[a-z](?=%3A$)/i)?.[0];
        if (diskLetter) {
            main.shift();
            header = `[file·${diskLetter}]`;
        } else {
            header = `[file]`;
        }
    } else {
        const part1 = u.protocol.slice(0, -1);
        const part2 = main.shift();
        header = `[${part1}·${part2}]`;
    }
    let searchPad = pathnameNorm.endsWith("/") ? "  " : " ";
    if (pathnameNorm.endsWith("/") && pathnameNorm.length > 1) {
        searchPad = "· ";
    }
    let search = u.search ? searchPad + encodeSearch(decodeURIComponent(u.search.slice(1))) : "";

    search = search.replaceAll("%20", "+");
    search = search.replaceAll("%2F", "·");
    if (search.endsWith("·") && !u.hash) {
        search = search.slice(0, -1);
    }

    let hash = u.hash ? "#" + encodeHash(decodeURIComponent(u.hash.slice(1))) : "";
    if (hash && !search && !main.length) {
        hash = " " + hash;
    }
    if (hash.endsWith("·")) {
        hash = hash.slice(0, -1);
    }

    const last = search + hash;
    return [header, main.join("·")].filter(o => o).join(" ") + last;
}


export function prependCss(href: string, integrity?: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.onload = resolve;
        link.onerror = event => {
            reject(Object.assign(new Error("Failed to load css"), {href, integrity, event}));
        };
        link.href = href;
        if (integrity) {
            link.integrity = integrity;
            link.crossOrigin = "anonymous";
        }
        const firstLink = document.head.querySelector(`link[rel="stylesheet"]`);
        if (firstLink) {
            firstLink.before(link);
        } else {
            document.head.prepend(link);
        }
    });
}


// console.log("%cHelloWorld", cssBlue);
const cssBlue   = "color: #2196f3; font-weight: bold;";
const cssIndigo = "color: #3f51b5; font-weight: bold;";
export function logBlue(...args: any[]) {
    return console.log.bind(console, "%c" + args[0], cssBlue, ...args.slice(1));
}
export function logIndigo(...args: any[]) {
    return console.log.bind(console, "%c" + args[0], cssIndigo, ...args.slice(1));
}


export async function hashBlob(blob: Blob): Promise<string> {
    try {
        const hash = await crypto.subtle.digest("SHA-1", await blob.arrayBuffer());
        return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, "0")).join("");
    } catch (e) {
        console.error(e);
        return "";
    }
}
