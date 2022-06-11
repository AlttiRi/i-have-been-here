import {ref, readonly} from "../../libs/vue-reactivity.js";
import {getFromStoreLocal, setToStoreLocal} from "../../util-ext.js";

/** @type {RefImpl<boolean>} */
export const isBOMReady = ref(false);
let resolve;
/** @type {Promise} */
export const onBOMReady = new Promise(_resolve => resolve = _resolve);
/** @type {RefImpl<boolean|null>} */
const bookmarkOpenerMode = ref(null);

async function init() {
    /** @type {boolean|undefined} */
    let bom = await getFromStoreLocal("bookmarkOpenerMode");
    if (bom === undefined) {
        await setToStoreLocal("bookmarkOpenerMode", false);
        bom = false;
    }
    bookmarkOpenerMode.value = bom;
    isBOMReady.value = true;
    resolve();
}
void init();

const bom = readonly(bookmarkOpenerMode);
export {bom as bookmarkOpenerMode};

export async function setBookmarkOpenerMode(newValue) {
    if (newValue !== bookmarkOpenerMode.value) {
        await setToStoreLocal("bookmarkOpenerMode", newValue);
    }
    bookmarkOpenerMode.value = newValue;
}
