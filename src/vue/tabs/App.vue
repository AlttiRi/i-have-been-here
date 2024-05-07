<template>
  <TabsAsync/>
</template>

<script setup lang="ts">
import {defineAsyncComponent} from "vue";
import {prependCss} from "@/util";


const cssReady = prependCss("/libs/bootstrap.css");

const TabsComp = import("./components/Tabs.vue");
const TabsAsync = defineAsyncComponent(async () => {
  try {
    await cssReady;
  } catch (e) {
    console.error(e, e.href);
  }
  return TabsComp;
});
</script>
