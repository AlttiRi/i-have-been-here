<script setup lang="ts">
import ScreenshotItem from "@/vue/list/components/ScreenshotItem.vue";
import {ref} from "vue";
import {ScreenshotInfo} from "@/types";
import {getFromStoreLocal} from "@/util-ext";

const screenshots = ref<ScreenshotInfo[]>([]);
getFromStoreLocal("screenshots").then(value => {
  screenshots.value = value || [];
  console.log("Screenshots:", value);
});
</script>

<template>
  <div data-comp="ScreenshotsPage" id="screenshots">
    <ScreenshotItem v-for="screenshot of screenshots" :screenshot/>
  </div>
</template>

<style scoped>

</style>
