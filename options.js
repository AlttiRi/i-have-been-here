import {downloadShelf, setDownloadShelf} from "./bg/store/dl-shelf.js";
import {watchEffect} from "./libs/vue-reactivity.js";

const listUrl = new URL("./list.html", location.href).toString();
const optionsUrl = new URL("./options.html", location.href).toString();
document.body.insertAdjacentHTML("afterbegin", `
    <div>List: <a href="${listUrl}">${listUrl}</a></div>
    <div>Options: <a href="${optionsUrl}">${optionsUrl}</a></div>
    <button id="d" class="btn m-3">Download shelf</button>
`);

const downloadShelfBtn = document.querySelector("#d");
downloadShelfBtn.addEventListener("click", async (event) => {
    console.log(downloadShelf.value);
    await setDownloadShelf(!downloadShelf.value);
});

watchEffect(() => {
    downloadShelfBtn.textContent = "Download shelf " + (downloadShelf.value ? "✅" : "⬜");
});
