<script setup lang="ts">
import {ref} from "vue";
import {GetTabsGS} from "@/src/message-center";
import {logTabs} from "./core";

const tabs = ref<chrome.tabs.Tab[]>();
async function update() {
  tabs.value = await GetTabsGS.get();
  logTabs(tabs.value);
}
update();


</script>

<template>
  <div data-comp="TabsJson">
    <div @click="update">
      <pre>{{JSON.stringify(tabs, null, "   ")}}</pre>
    </div>
  </div>
</template>

<style scoped>

</style>
