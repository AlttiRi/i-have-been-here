<script setup lang="ts">
import {ref} from "vue";
import {sleep} from "@alttiri/util-js";
import {ScreenshotInfo}    from "@/types";
import {getFromStoreLocal} from "@/util-ext";
import {waitMe, iAmReady}  from "@/vue-pages/header/router";
import Controls            from "./Controls.vue";
import ScreenshotItem      from "./ScreenshotItem.vue";
import {allImagesReady}    from "./core-list";


const screenshots = ref<ScreenshotInfo[]>([]);

waitMe();
void getFromStoreLocal("screenshots").then(value => {
  screenshots.value = value?.reverse() || [];
  console.log("🖼 Screenshots:", value);
  sleep().then(() => Promise.all(allImagesReady.value).then(iAmReady).then(() => allImagesReady.value = []));
});
</script>

<template>
  <div data-comp="ScreenshotsPage" id="screenshots-page" class="container">
    <Controls :activePage="'screens'"/>
    <div id="screenshots">
      <ScreenshotItem v-for="screenshot of screenshots" :screenshot/>
    </div>
  </div>
</template>

<style scoped>
#screenshots {
  left: 0;
  position: absolute;
}
</style>
