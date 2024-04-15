import {binaryStringToArrayBuffer, Base64, BinaryString, JpgDataURL} from "../util.js";

// In Chrome binary takes more space than base64, however. // Need to test it more with large data
const binary = false;
// const useBase85 = false;
// const base85 = {encode, decode};

export function toDataUrl(storeData: Base64 | BinaryString): JpgDataURL {
    let base64 = storeData;
    // if (useBase85) {
    //     base64 = btoa(arrayBufferToBinaryString(base85.decode(storeData, "z85")));
    // } else
    if (binary) {
        base64 = btoa(storeData);
    }
    return ("data:image/jpeg;base64," + base64) as JpgDataURL;
}

export function toArrayBuffer(storeData: Base64 | BinaryString): Uint8Array {
    // if (useBase85) {
    //     return base85.decode(storeData, "z85");
    // }
    let binaryString;
    if (binary) {
        binaryString = storeData;
    } else {
        binaryString = atob(storeData);
    }
    return binaryStringToArrayBuffer(binaryString);
}

export function toStoreData(dataUrl: JpgDataURL): Base64 {
    const base64: Base64 = dataUrl.substring("data:image/jpeg;base64,".length);
    // if (useBase85) {
    //     return base85.encode(binaryStringToArrayBuffer(atob(base64)), "z85");
    // }
    if (binary) {
        return atob(base64);
    }
    return base64;
}
