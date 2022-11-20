import {dlShelf, bom, quickAccessUrl} from "/bg/store/store.js";
import {watchEffect} from "/libs/vue-reactivity.js";


document.body.insertAdjacentHTML("beforeend", `
    <h4>Options</h4>
    <button id="download-shelf" class="btn m-3">Download shelf</button>
    <button id="bom" class="btn m-3">Bookmarks opener mode</button>
    <hr>
    <label style="display: contents">
        <h4>Quick access URL</h4>
        <input  id="quick-url" type="text"  class="form-control">
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


const bomBtn = document.querySelector("#bom");
bomBtn.addEventListener("click", async (event) => {
    await bom.setValue(!bom.value);
});

watchEffect(() => {
    bomBtn.textContent = "Bookmarks opener mode " + (bom.value ? "✅" : "⬜");
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
