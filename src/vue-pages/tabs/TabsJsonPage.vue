<script setup lang="ts">
import {ref} from "vue";
import {logTabs}     from "./core-tabs";
import {iAmReady, waitMe} from "@/vue-pages/header/router";
import {getTabs} from "@/vue-pages/common";

const tabs = ref<chrome.tabs.Tab[]>();
async function update() {
  tabs.value = await getTabs();
  logTabs(tabs.value);
}

waitMe();
void update()
  .then(() => iAmReady("TabsJsonPage"));


</script>

<template>
  <div data-comp="TabsJsonPage" class="container">
    <div @click="update">
      <pre>{{JSON.stringify(tabs, null, "   ")}}</pre>
    </div>
  </div>
</template>

<style scoped>

</style>
