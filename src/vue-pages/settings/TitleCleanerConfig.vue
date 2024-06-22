<script setup lang="ts">
import {ref, Ref, watch} from "vue";
import {debounce, sleep} from "@/util";
import {tcRuleStrings, tcCompiledRules} from "@/bg/store/store";
import {isTCRuleStringArray, TCRuleString, TitleCleaner} from "@/title-cleaner";
import {isString} from "@alttiri/util-js";


const saveBtn: Ref<HTMLButtonElement | null> = ref(null);

const editorValue: Ref<string> = ref("");
tcRuleStrings.getValue()
  .then(value => editorValue.value = formatRuleStringArray(value));

async function save() {
  const btn = saveBtn.value!;
  btn.blur();
  try {
    let json = JSON.parse(editorValue.value);
    if (!json) {
      json = tcRuleStrings.defaultValue;
    }
    await tcRuleStrings.setValue(json as TCRuleString[]);
    const compiledRules = TitleCleaner.compileRuleStrings(tcRuleStrings.value);
    await tcCompiledRules.setValue(compiledRules);
    btn.classList.add("btn-outline-success");
  } catch {
    btn.classList.add("btn-warning");
    btn.classList.remove("btn-outline-primary");
  }

  await sleep(800);
  btn.classList.add("btn-outline-primary");
  btn.classList.remove("btn-outline-success");
  btn.classList.remove("btn-warning");
}

const handleInputDebounced = debounce(handleInput, 280);
watch(editorValue, () => {
  handleInputDebounced();
});

function handleInput() {
  const btn = saveBtn.value;
  if (!btn) {
    return;
  }
  try {
    const array: any = JSON.parse(editorValue.value);
    if (!Array.isArray(array)) {
      btn.classList.add("disabled");
      btn.title = "Not an array";
      return;
    }
    if (array.length !== array.flat().length) {
      btn.title = "Array is not flat";
      return false;
    }
    if (!array.every(isString)) {
      btn.title = "Array is not string one";
      return false;
    }
    if (!isTCRuleStringArray(array)) {
      btn.title = "Wrong data in the rule array";
      btn.classList.add("disabled");
      return;
    }
    btn.classList.remove("disabled");
  } catch (e) {
    btn.title = "Wrong JSON";
    btn.classList.add("disabled");
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
    <h4 title="String Rules based config">Title Cleaner Config</h4>
    <textarea spellcheck="false" id="editor" class="form-control"
              v-model="editorValue"
    ></textarea>
    <br>
    <button ref="saveBtn" id="save" class="btn btn-outline-primary" @click="save">Save</button>
    <hr>
  </div>
</template>

<style scoped>
#editor {
  /*width: 540px;*/
  min-height: 400px;
}
</style>
