<script setup lang="ts">
import {debounce, isString, sleep}                       from "@alttiri/util-js";
import {isTCRuleStringArray, TCRuleString, TitleCleaner} from "@alttiri/string-magic";
import {ref, Ref, watch} from "vue";
import {tcRuleStrings, tcCompiledRules} from "@/bg/store/store";


const saveBtn: Ref<HTMLButtonElement | null> = ref(null);
const saved: Ref<boolean> = ref(true);
const valid: Ref<boolean> = ref(true);

const warnText: Ref<string> = ref("");
const editorValue: Ref<string> = ref("");
let lastSavedEditorValue = "";

const handleInputDebounced = debounce(handleInput, 220);
tcRuleStrings.getValue()
  .then(value => {
    editorValue.value = formatRuleStringArray(value);
    lastSavedEditorValue = editorValue.value;
    watch(editorValue, handleInputDebounced);
  });

async function save() {
  const btn = saveBtn.value!;
  btn.blur();

  const json = JSON.parse(editorValue.value);
  await tcRuleStrings.setValue(json as TCRuleString[]);
  const compiledRules = TitleCleaner.compileRuleStrings(tcRuleStrings.value);
  await tcCompiledRules.setValue(compiledRules);
  lastSavedEditorValue = editorValue.value;
  btn.classList.add("btn-outline-success");

  await sleep(800);
  saved.value = true;
  btn.classList.remove("btn-outline-success");
}


function handleInput() {
  const btn = saveBtn.value;
  if (!btn) {
    return;
  }
  if (editorValue.value === lastSavedEditorValue) {
    saved.value = true;
    valid.value = true;
    warnText.value = "";
    return;
  }
  valid.value = false;
  saved.value = false;

  // if (!editorValue.value) {
  //   editorValue.value = formatRuleStringArray(tcRuleStrings.defaultValue);
  //   // todo add restore btn
  // }

  try {
    const array: any = JSON.parse(editorValue.value);
    if (!Array.isArray(array)) {
      warnText.value = "Not an array";
      return;
    }
    if (array.length !== array.flat().length) {
      warnText.value = "Array is not flat";
      return;
    }
    if (!array.every(isString)) {
      warnText.value = "Array is not string one";
      return;
    }
    if (!isTCRuleStringArray(array)) {
      warnText.value = "Wrong data in the rule string array";
      return;
    }
    valid.value = true;
    warnText.value = "";
  } catch (e) {
    warnText.value = "Incorrect JSON";
  }
}

function formatRuleStringArray(array: TCRuleString[]): string {
  let str = JSON.stringify(array, null, 4);
  str = str.replaceAll(`    "site`, `"site`);
  return str;
}


</script>

<template>
  <div data-comp="TitleCleanerConfig">
    <h4 title="Rule String Array based config">Title Cleaner Config</h4>
    <textarea spellcheck="false" id="editor" class="form-control"
              v-model="editorValue"
    ></textarea>
    <br>
    <button ref="saveBtn" id="save" class="btn btn-outline-primary"
            @click="save"
            :class="{
              disabled: saved || !valid,
            }"
    >Save</button>
    <span class="warning">{{warnText}}</span>
  </div>
</template>

<style scoped>
#editor {
  /*width: 540px;*/
  min-height: 400px;
}
.warning {
  margin: 0 10px;
  color: grey;
}
</style>
