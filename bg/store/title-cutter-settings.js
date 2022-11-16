import {ref, readonly} from "../../libs/vue-reactivity.js";
import {getFromStoreLocal, setToStoreLocal} from "../../util-ext.js";

/** @type {Object} */
export const defaultValue = {
    "example.com": {
        "trimEnd": [" - example"],
        "trimStart": ["☑", "✅"],
        "trimStartEnd": [
            ["[", "]"]
        ]
    },
    "www.artstation.com": {
        "trimStart": ["ArtStation - "]
    }
};


// Or just use `watchEffect`
/** @type {import("@vue/reactivity").Ref<boolean>} */
export const isTCSReady = ref(false);
let resolve;
/** @type {Promise} */
export const onTCSRReady = new Promise(_resolve => resolve = _resolve);
/** @type {import("@vue/reactivity").Ref<Object|null>} */
const titleCutterSettings = ref(defaultValue);

async function init() {
    /** @type {Object|undefined} */
    let tcs = await getFromStoreLocal("titleCutterSettings");
    if (tcs === undefined) {
        await setToStoreLocal("titleCutterSettings", defaultValue);
        tcs = defaultValue;
    }
    titleCutterSettings.value = tcs;
    isTCSReady.value = true;
    resolve();
}
void init();

const ro = readonly(titleCutterSettings);
export {ro as titleCutterSettings};

export async function setTitleCutterSettings(newValue, isSync = false) {
    if (newValue === titleCutterSettings.value) {
        return;
    }
    if (isSync) {
        titleCutterSettings.value = newValue;
        return;
    }
    await setToStoreLocal("titleCutterSettings", newValue);
    titleCutterSettings.value = newValue;
    chrome.runtime.sendMessage({
        command: "set-title-cutter-settings--message",
        data: newValue
    });
}

chrome.runtime.onMessage.addListener(message => {
    if (message.command === "set-title-cutter-settings--message") {
        void setTitleCutterSettings(message.data, true);
    }
});
