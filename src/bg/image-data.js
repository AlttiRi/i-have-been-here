import {binaryStringToArrayBuffer} from "../util.js";

// In Chrome binary takes more space than base64, however. // Need to test it more with large data
const binary = false;
// const useBase85 = false;
// const base85 = {encode, decode};

export function toDataUrl(storeData) {
    let base64 = storeData;
    // if (useBase85) {
    //     base64 = btoa(arrayBufferToBinaryString(base85.decode(storeData, "z85")));
    // } else
    if (binary) {
        base64 = btoa(storeData);
    }
    return "data:image/jpeg;base64," + base64;
}

export function toArrayBuffer(storeData) {
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

export function toStoreData(dataUrl) {
    const base64 = dataUrl.substring("data:image/jpeg;base64,".length);
    // if (useBase85) {
    //     return base85.encode(binaryStringToArrayBuffer(atob(base64)), "z85");
    // }
    if (binary) {
        return atob(base64);
    }
    return base64;
}
