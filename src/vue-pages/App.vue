<template>
  <MainAsync/>
</template>

<script setup lang="ts">
import {defineAsyncComponent} from "vue";
import {prependCss} from "@/utils/util";
import {onBgReady}  from "@/vue-pages/common";


const cssReady = prependCss("/libs/bootstrap.css");

const MainComp = import("./Main.vue");
const MainAsync = defineAsyncComponent(async () => {
  try {
    await cssReady;
    await onBgReady;
  } catch (e) {
    console.error(e, e.href);
  }
  return MainComp;
});
</script>
