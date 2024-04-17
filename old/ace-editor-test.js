// from "options-title-cut-settings.js"

import {
    isTCSReady,
    onTCSRReady,
} from "./bg/store/title-cutter-settings.js";
async function initEditor() {
    const editor = document.querySelector("#editor");
    if (!isTCSReady.value) {
        await onTCSRReady;
    }
    editor.value = titleCutterSettings.value;
}
void initEditor();



document.body.insertAdjacentHTML("afterbegin", `
    <div class="">Settings</div>

    <div id="editor">some text</div>

`);

const editor = ace.edit("editor");

// editor.setTheme("ace/theme/tomorrow");
editor.setOptions({
    fontSize: 15,
    highlightActiveLine: false,
    tabSize: 4,
    theme: "ace/theme/tomorrow",
    useWorker: true,
    wrap: true,
});
editor.getSession().setMode("ace/mode/json");

console.log(editor);


const beautify = ace.require("ace/ext/beautify");
console.log(beautify);
beautify.beautify(editor.session);
