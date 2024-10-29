import {binaryStringToArrayBuffer, Base64, JpgDataURL, BinaryString, toHex} from "@/utils/util";
import {ScreenshotDataId} from "@/common/types";

// todo re-test base85, binary string

export function toJpgDataUrl(base64: Base64): JpgDataURL {
    return ("data:image/jpeg;base64," + base64) as JpgDataURL;
}

export function toArrayBuffer(base64: Base64): Uint8Array {
    const binaryString: BinaryString = atob(base64);
    return binaryStringToArrayBuffer(binaryString);
}

const prefixLength: number = "data:image/jpeg;base64,".length;
export function toStoreData(dataUrl: JpgDataURL): Base64 {
    return dataUrl.substring(prefixLength);
}

export async function getScdId(base64: Base64): Promise<ScreenshotDataId> {
    const jpgUI8A: Uint8Array = toArrayBuffer(base64);
    const hashAB: ArrayBuffer = await crypto.subtle.digest("SHA-1", jpgUI8A);
    const hash: Lowercase<string> = toHex(hashAB).slice(0, 12) as Lowercase<string>;
    return `scd:${hash}`;
}
