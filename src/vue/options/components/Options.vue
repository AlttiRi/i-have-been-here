<script setup lang="ts">
import {computed, watchEffect} from "vue";
import {dlShelf, filenameLengthLimit, quickAccessUrl, urlOpenerMode} from "@/src/bg/store/store";

import Header       from "./Header.vue";
import TitleTrimmer from "./TitleTrimmer.vue";


const dlShelfBtnText = computed(() => {
  return "Download shelf " + (dlShelf.value ? "✅" : "⬜");
});
async function toggleDlShelf() {
  await dlShelf.setValue(!dlShelf.value);
}

const urlOpenerModeBtnText = computed(() => {
  return "Quick URL opener mode " + (urlOpenerMode.value ? "✅" : "⬜");
});
async function toggleUrlOpenerMode() {
  await urlOpenerMode.setValue(!urlOpenerMode.value);
}

const quickUrlInputTitle = computed(() => {
  return new URL(quickAccessUrl.value, location.origin).href;
});
watchEffect(() => {
  if (quickAccessUrl.value === " ") {
    quickAccessUrl.value = quickAccessUrl.defaultValue;
  }
});

</script>

<template>
  <div data-comp="Options" id="options" class="container">
    <Header/>
    <h4>Options</h4>
    <button id="download-shelf" class="btn m-3" @click="toggleDlShelf">{{dlShelfBtnText}}</button>
    <button id="url-opener-mode" class="btn m-3" @click="toggleUrlOpenerMode">{{urlOpenerModeBtnText}}</button>
    <hr>
    <label style="display: contents">
      <h4>Filename length limit</h4>
      <input id="filename-length-limit" class="form-control"
             type="number"
             v-model="filenameLengthLimit.value"
      >
    </label>
    <hr>
    <label style="display: contents">
      <h4>Quick access URL</h4>
      <input id="quick-url" class="form-control"
             type="text"
             v-model="quickAccessUrl.value"
             :title="quickUrlInputTitle"
      >
    </label>
    <hr>
    <TitleTrimmer/>
  </div>
</template>

<style>

</style>
