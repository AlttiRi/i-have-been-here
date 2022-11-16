import {downloadShelf, setDownloadShelf} from "./bg/store/dl-shelf.js";
import {watchEffect} from "./libs/vue-reactivity.js";
import {bookmarkOpenerMode, setBookmarkOpenerMode} from "./bg/store/bom.js";

const listUrl = new URL("./list.html", location.href).toString();
const optionsUrl = new URL("./options.html", location.href).toString();
const titleCutterSettingsUrl = new URL("./title-settings.html", location.href).toString();
const openedTabsUrl = new URL("./opened-tabs.html", location.href).toString();
document.body.insertAdjacentHTML("afterbegin", `
    <div>List: <a href="${listUrl}">${listUrl}</a></div>
    <div>Options: <a href="${optionsUrl}">${optionsUrl}</a></div>
    <div>Title Cutter Settings: <a href="${titleCutterSettingsUrl}">${titleCutterSettingsUrl}</a></div>
    <div>Opened Tabs: <a href="${openedTabsUrl}">${openedTabsUrl}</a></div>
    <button id="download-shelf" class="btn m-3">Download shelf</button>
    <button id="bom" class="btn m-3">Bookmarks opener mode</button>
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
