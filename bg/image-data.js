import {binaryStringToArrayBuffer} from "../util.js";

// In Chrome binary takes more space than base64, however.
const binary = false;

export function toBase64(data) {
    if (binary) {
        data = btoa(data);
    }
    return "data:image/jpeg;base64," + data;
}

export function toArrayBuffer(data) {
    if (binary) {
        return binaryStringToArrayBuffer(data);
    }
    return binaryStringToArrayBuffer(atob(data));
}

export function toData(dataUrl) {
    if (binary) {
        return atob(dataUrl.substring("data:image/jpeg;base64,".length));
    }
    return dataUrl.substring("data:image/jpeg;base64,".length);
}
