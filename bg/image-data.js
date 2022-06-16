import {binaryStringToArrayBuffer} from "../util.js";

// In Chrome binary takes more space than base64, however.
const binary = false;

const useBase85 = false;
const base85 = {
    encode: data => data,
    decode: data => data
}

export function toUrl(storeData) {
    let base64 = storeData;
    if (binary) {
        let binaryString = storeData;
        if (useBase85) {
            binaryString = base85.decode(storeData);
        }
        base64 = btoa(binaryString);
    }
    return "data:image/jpeg;base64," + base64;
}

export function toArrayBuffer(storeData) {
    let binaryString;
    if (binary) {
        binaryString = storeData;
        if (useBase85) {
            binaryString = base85.decode(storeData);
        }
    } else {
        binaryString = atob(storeData);
    }
    return binaryStringToArrayBuffer(binaryString);
}

export function toStoreData(dataUrl) {
    const base64 = dataUrl.substring("data:image/jpeg;base64,".length);
    if (binary) {
        let binaryString = atob(base64);
        if (useBase85) {
            return base85.encode(binaryString);
        }
        return binaryString;
    }
    return base64;
}
