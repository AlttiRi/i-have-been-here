import {ref, readonly} from "../../libs/vue-reactivity.js";
import {getFromStoreLocal, setToStoreLocal} from "../../util-ext.js";

/** @type {import("@vue/reactivity").Ref<boolean>} */
export const isDlShelfReady = ref(false);
let resolve;
/** @type {Promise} */
export const onDlShelfReady = new Promise(_resolve => resolve = _resolve);
/** @type {import("@vue/reactivity").Ref<boolean|null>} */
const downloadShelf = ref(null);

async function init() {
    /** @type {boolean|undefined} */
    let dlShelf = await getFromStoreLocal("downloadShelf");
    if (dlShelf === undefined) {
        await setToStoreLocal("downloadShelf", true);
        dlShelf = true;
    }
    downloadShelf.value = dlShelf;
    isDlShelfReady.value = true;
    resolve();
}
void init();

const bom = readonly(downloadShelf);
export {bom as downloadShelf};

export async function setDownloadShelf(newValue) {
    if (newValue !== downloadShelf.value) {
        await setToStoreLocal("downloadShelf", newValue);
        downloadShelf.value = newValue;
    }
}


