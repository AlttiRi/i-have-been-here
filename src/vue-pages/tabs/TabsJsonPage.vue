<script setup lang="ts">
import {ref} from "vue";
import {GetTabsGS} from "@/message-center";
import {logTabs}   from "./core-tabs";
import {iAmReady, waitMe} from "@/vue-pages/header/router";

const tabs = ref<chrome.tabs.Tab[]>();
async function update() {
  tabs.value = await GetTabsGS.get();
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
