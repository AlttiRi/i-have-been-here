<script setup lang="ts">
import {ref, watchEffect} from "vue";
import {sleep}      from "@/util";
import {tcSettings} from "@/bg/store/store";

const editorValue = ref("");

async function save(event: MouseEvent) {
  const btn = event.currentTarget as HTMLButtonElement;
  btn.blur();
  try {
    let json = JSON.parse(editorValue.value);
    if (!json) {
      json = tcSettings.defaultValue;
    }
    await tcSettings.setValue(json);
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

watchEffect(() => {
  editorValue.value = JSON.stringify(tcSettings.value, null, "    ");
});

</script>

<template>
  <div data-comp="TitleTrimmer">
    <h4 class="">Title Trimmer Settings</h4>
    <textarea spellcheck="false" id="editor" class="form-control"
              v-model="editorValue"
    ></textarea>
    <br>
    <button id="save" class="btn btn-outline-primary" @click="save">Save</button>
    <hr>
  </div>
</template>

<style scoped>
#editor {
  /*width: 540px;*/
  min-height: 400px;
}
</style>
