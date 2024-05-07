<template>
  <SettingsAsync/>
</template>

<script setup lang="ts">
import {defineAsyncComponent} from "vue";
import {prependCss} from "@/util";


const cssReady = prependCss("/libs/bootstrap.css");

const SettingsComp = import("./components/Settings.vue");
const SettingsAsync = defineAsyncComponent(async () => {
  try {
    await cssReady;
  } catch (e) {
    console.error(e, e.href);
  }
  return SettingsComp;
});
</script>
