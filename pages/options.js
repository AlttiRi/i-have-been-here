import {dlShelf, urlOpenerMode, quickAccessUrl, filenameLengthLimit} from "/bg/store/store.js";
import {watchEffect} from "/libs/vue-reactivity.js";


document.body.insertAdjacentHTML("beforeend", `
    <h4>Options</h4>
    <button id="download-shelf" class="btn m-3">Download shelf</button>
    <button id="url-opener-mode" class="btn m-3">Quick Access URL opener mode</button>
    <hr>
    <label style="display: contents">
        <h4>Filename length limit</h4>
        <input  id="filename-length-limit" class="form-control"  type="number">
    </label>
    <hr>
    <label style="display: contents">
        <h4>Quick access URL</h4>
        <input id="quick-url" type="text" class="form-control">
    </label>
    <hr>
`);

const downloadShelfBtn = document.querySelector("#download-shelf");
downloadShelfBtn.addEventListener("click", async (event) => {
    await dlShelf.setValue(!dlShelf.value);
});

watchEffect(() => {
    downloadShelfBtn.textContent = "Download shelf " + (dlShelf.value ? "✅" : "⬜");
});


const urlOpenerModeBtn = document.querySelector("#url-opener-mode");
urlOpenerModeBtn.addEventListener("click", async (event) => {
    await urlOpenerMode.setValue(!urlOpenerMode.value);
});

watchEffect(() => {
    urlOpenerModeBtn.textContent = "Quick URL opener mode " + (urlOpenerMode.value ? "✅" : "⬜");
});


const quickUrlInput = document.querySelector("#quick-url");
watchEffect(() => {
    quickUrlInput.value = quickAccessUrl.value;
    quickUrlInput.title = new URL(quickAccessUrl.value, location.origin).href;
});
quickUrlInput.addEventListener("input", event => {
    let inputText = quickUrlInput.value;
    if (quickUrlInput.value === " ") {
        inputText = quickAccessUrl.defaultValue;
    }
    void quickAccessUrl.setValue(inputText);
});



const filenameLengthLimitInput = document.querySelector("#filename-length-limit");
filenameLengthLimitInput.addEventListener("input", async (event) => {
    await filenameLengthLimit.setValue(Number(filenameLengthLimitInput.value));
});

watchEffect(() => {
    filenameLengthLimitInput.value = filenameLengthLimit.value;
});
