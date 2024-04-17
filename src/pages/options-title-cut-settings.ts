import {tcSettings} from "../bg/store/store.js";
import {watchEffect} from "../../libs/vue-reactivity.js";
import {sleep} from "../util.js";

document.body.insertAdjacentHTML("beforeend", `
    <h4 class="">Title Cutter Settings</h4>    
    <textarea spellcheck="false" id="editor" class="form-control"></textarea>
    <br>
    <button id="save" class="btn btn-outline-primary">Save</button>
    <hr>
`);

const editorElem: HTMLTextAreaElement = document.querySelector("#editor")!;
const saveBtnElem: HTMLButtonElement = document.querySelector("#save")!;

saveBtnElem.addEventListener("click", async (event) => {
    saveBtnElem.blur();

    console.log(editorElem.value);

    try {
        let json = JSON.parse(editorElem.value);
        if (!json) {
            json = tcSettings.defaultValue;
        }
        await tcSettings.setValue(json);
        saveBtnElem.classList.add("btn-outline-success");
    } catch {
        saveBtnElem.classList.add("btn-warning");
        saveBtnElem.classList.remove("btn-outline-primary");
    }

    await sleep(800);
    saveBtnElem.classList.add("btn-outline-primary");
    saveBtnElem.classList.remove("btn-outline-success");
    saveBtnElem.classList.remove("btn-warning");
});

watchEffect(() => {
    editorElem.value = JSON.stringify(tcSettings.value, null, "    ");
});
