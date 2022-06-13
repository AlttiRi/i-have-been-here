export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function downloadBlob(blob, name, url) {
    const anchor = document.createElement("a");
    anchor.setAttribute("download", name || "");
    const blobUrl = URL.createObjectURL(blob);
    anchor.href = blobUrl + (url ? ("#" + url) : "");
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
}

export const isFirefox = typeof navigator === "object" && navigator.userAgent.includes("Firefox");
export const isOpera   = typeof navigator === "object" && navigator.userAgent.includes("OPR") || typeof window === "object" && typeof window.opr !== "undefined";


export function logPicture(url, scale) {
    void logPictureAsync(url, scale);
}

export async function logPictureAsync(url, scale = 0.5) {
    let dataUrl;
    if (isBlobUrl(url)) {
        dataUrl = await blobUrlToDataUrl(url);
    } else {
        dataUrl = url;
    }

    const img = new Image();
    const imageLoaded = new Promise(resolve => img.onload = resolve);
    img.src = dataUrl;
    await imageLoaded;

    console.log("%c ", `
       padding: ${Math.floor(img.height * scale / 2)}px ${Math.floor(img.width * scale / 2)}px;
       background: url("${img.src}");
       background-size: ${img.width * scale}px ${img.height * scale}px;
       font-size: 0;
    `);
}
console.image = logPicture;

async function blobUrlToDataUrl(blobUrl) {
    const response = await fetch(blobUrl);
    const blob = await response.blob()
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.readAsDataURL(blob);
    });
}

function isBlobUrl(url) {
    return url.toString().startsWith("blob:");
}


export function emojiToImageData(emoji, size = 64, multiplier = 1) {
    const {context} = emojiTo(emoji, size, multiplier);
    return context.getImageData(0, 0, size, size);
}

export function emojiToBlob(emoji, size, multiplier) {
    const {canvas} = emojiTo(emoji, size, multiplier);
    return new Promise(resolve => canvas.toBlob(resolve));
}

export function emojiToDataURL(emoji, size, multiplier) {
    const {canvas} = emojiTo(emoji, size, multiplier);
    const dataUrl = canvas.toDataURL("png", 100);
    // console.log(dataUrl);
    return dataUrl;
}

export async function emojiToBlobURL(emoji, size, multiplier, revokeDelay = 100000) {
    const blob = await emojiToBlob(emoji, size, multiplier);
    const url = URL.createObjectURL(blob);
    // console.log(url, blob, await blob.arrayBuffer());
    setTimeout(_ => URL.revokeObjectURL(url), revokeDelay);
    return url;
}

/** @return {{canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}} */
function emojiTo(emoji = "⬜", size = 64, multiplier = 1.01) {

    /** @type {HTMLCanvasElement} */
    const canvas = document.createElement("canvas");
    canvas.width  = size;
    canvas.height = size;
    /** @type {CanvasRenderingContext2D} */
    const context = canvas.getContext("2d");

    context.font = size * 0.875 * multiplier + "px serif";
    context.textBaseline = "middle";
    context.textAlign = "center";

    const x = size / 2;
    const y = size / 2 + Math.round(size - size * 0.925);

    context.fillText(emoji, x, y);

    return {canvas, context};
}

// "Sun, 10 Jan 2021 22:22:22 GMT" -> "2021.01.10"
export function dateToDayDateString(dateValue, utc = true) {
    const _date = new Date(dateValue);
    function pad(str) {
        return str.toString().padStart(2, "0");
    }
    const _utc = utc ? "UTC" : "";
    const year  = _date[`get${_utc}FullYear`]();
    const month = _date[`get${_utc}Month`]() + 1;
    const date  = _date[`get${_utc}Date`]();

    return year + "." + pad(month) + "." + pad(date);
}

export class LS {
    static getItem(name, defaultValue) {
        const value = localStorage.getItem(name);
        if (value === undefined) {
            return undefined;
        }
        if (value === null) { // when there is no such item
            LS.setItem(name, defaultValue);
            return defaultValue;
        }
        return JSON.parse(value);
    }
    static setItem(name, value) {
        localStorage.setItem(name, JSON.stringify(value));
    }
    static removeItem(name) {
        localStorage.removeItem(name);
    }
    static pushItem(name, value) {
        const array = LS.getItem(name, []);
        array.push(value);
        LS.setItem(name, array);
    }
    static popItem(name, value) {
        const array = LS.getItem(name, []);
        if (array.indexOf(value) !== -1) {
            array.splice(array.indexOf(value), 1);
            LS.setItem(name, array);
        }
    }
}

export function binaryStringToArrayBuffer(binaryString) {
    const u8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        u8Array[i] = binaryString.charCodeAt(i);
    }
    return u8Array;
}

const encodeMap = new Map([
 // [ " ",   "+"], // "%20"
    ["\"", "%22"],
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
]);
function encodeName(name) {
    return name.replaceAll(/["/*:<>?\\|]/g, ch => encodeMap.get(ch));
}
export function fullUrlToFilename(url) {
    const u = new URL(url);
    const pt = u.pathname.startsWith("/") ? u.pathname.slice(1) : u.pathname;
    let seconds = [u.hostname, ...pt.split("/")].filter(o => o)
    seconds = seconds.map(o => decodeURIComponent(o));
    let header;
    if (u.protocol.startsWith("http")) {
        const hostname = u.hostname.startsWith("www.") ? u.hostname.slice(4) : u.hostname;
        header = `[${hostname}]`;
        seconds = seconds.slice(1);
    } else {
        const part1 = u.protocol.slice(0, -1);
        const part2 = seconds.shift();
        header = `[${part1}·${part2}]`;
    }
    let search = u.search ? "  " + encodeName(u.search.slice(1)) : "";
    search = search.replaceAll("%20", "+");
    let hash = encodeName(u.hash);
    if (hash && !search && !seconds.length) {
        hash = " " + hash;
    }
    const last = search + hash;
    return [header, ...seconds,].filter(o => o).join(" ") + last;
}
