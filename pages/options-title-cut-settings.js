import {tcSettings} from "/bg/store/store.js";
import {watchEffect} from "/libs/vue-reactivity.js";
import {sleep} from "/util.js";

document.body.insertAdjacentHTML("beforeend", `
    <h4 class="">Title Cutter Settings</h4>    
    <textarea spellcheck="false" id="editor"></textarea>
    <br>
    <button id="save" class="btn btn-outline-primary">Save</button>
`);

const editorElem = document.querySelector("#editor");
const saveBtnElem = document.querySelector("#save");

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




// import {
//     isTCSReady,
//     onTCSRReady,
// } from "./bg/store/title-cutter-settings.js";
// async function initEditor() {
//     const editor = document.querySelector("#editor");
//     if (!isTCSReady.value) {
//         await onTCSRReady;
//     }
//     editor.value = titleCutterSettings.value;
// }
// void initEditor();





// document.body.insertAdjacentHTML("afterbegin", `
//     <div class="">Settings</div>
//
//     <div id="editor">some text</div>
//
// `);
//
// const editor = ace.edit("editor");
//
// // editor.setTheme("ace/theme/tomorrow");
// editor.setOptions({
//     fontSize: 15,
//     highlightActiveLine: false,
//     tabSize: 4,
//     theme: "ace/theme/tomorrow",
//     useWorker: true,
//     wrap: true,
// });
// editor.getSession().setMode("ace/mode/json");
//
// console.log(editor);
//
//
// const beautify = ace.require("ace/ext/beautify");
// console.log(beautify);
// beautify.beautify(editor.session);
