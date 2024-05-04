<template>
  <OptionsAsync/>
</template>

<script setup lang="ts">
import {defineAsyncComponent} from "vue";
import {prependCss} from "@/src/util";


const cssReady = prependCss("/libs/bootstrap.css", "sha256-o+AsfCHj7A1M5Xgm1kJmZiGEIvMQEzQqrXz2072Gkkg=");

const OptionsComp = import("./components/Options.vue");
const OptionsAsync = defineAsyncComponent(async () => {
  try {
    await cssReady;
  } catch (e) {
    console.error(e, e.href);
  }
  return OptionsComp;
});
</script>
