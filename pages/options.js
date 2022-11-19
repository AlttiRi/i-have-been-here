import {downloadShelf, setDownloadShelf} from "/bg/store/dl-shelf.js";
import {watchEffect} from "/libs/vue-reactivity.js";
import {bookmarkOpenerMode, setBookmarkOpenerMode} from "/bg/store/bom.js";


document.body.insertAdjacentHTML("beforeend", `
    <h4>Options</h4>
    <button id="download-shelf" class="btn m-3">Download shelf</button>
    <button id="bom" class="btn m-3">Bookmarks opener mode</button>
    <hr>
`);

const downloadShelfBtn = document.querySelector("#download-shelf");
downloadShelfBtn.addEventListener("click", async (event) => {
    await setDownloadShelf(!downloadShelf.value);
});

watchEffect(() => {
    downloadShelfBtn.textContent = "Download shelf " + (downloadShelf.value ? "✅" : "⬜");
});


const bomBtn = document.querySelector("#bom");
bomBtn.addEventListener("click", async (event) => {
    await setBookmarkOpenerMode(!bookmarkOpenerMode.value);
});

watchEffect(() => {
    bomBtn.textContent = "Bookmarks opener mode " + (bookmarkOpenerMode.value ? "✅" : "⬜");
});
