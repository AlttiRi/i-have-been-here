import {dlShelf} from "/bg/store/dl-shelf.js";
import {watchEffect} from "/libs/vue-reactivity.js";
import {bom} from "/bg/store/bom.js";


document.body.insertAdjacentHTML("beforeend", `
    <h4>Options</h4>
    <button id="download-shelf" class="btn m-3">Download shelf</button>
    <button id="bom" class="btn m-3">Bookmarks opener mode</button>
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
