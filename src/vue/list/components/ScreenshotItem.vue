<script setup lang="ts">
import {ref} from "vue";
import {ScreenshotInfo}    from "@/types";
import {getFromStoreLocal} from "@/util-ext";
import {toJpgDataUrl}      from "@/bg/image-data";
import {fullUrlToFilename} from "@/util";
import {dateFormatter}     from "./core";

const props = defineProps<{screenshot: ScreenshotInfo}>();

const {url, created, title, scd_id} = props.screenshot;
const src = ref();
getFromStoreLocal(scd_id).then(base64 => src.value = toJpgDataUrl(base64));


</script>

<template>
  <div data-comp="ScreenshotItem" class="screenshot-item" :data-hash="scd_id" :data-created="created">
    <div class="info">
      <h3 class="title" style="align-self: start; margin: 12px;">{{ title || fullUrlToFilename(url) }}</h3>
      <div class="url"  style="align-self: start; margin: 12px;">{{ url }}</div>
      <div class="created" style="align-self: start; margin: 12px;">{{ created ? dateFormatter(created) : "" }}</div>
    </div>
    <img :src="src" :alt="title" :title="fullUrlToFilename(url)">
  </div>
</template>

<style scoped>
.info {
  padding-left: 12px;
}
.screenshot-item:hover .info {
  padding-left: 11px;
  border-left: 1px #0d6efd solid;
}
a:visited {
  color: #0a53be;
}
</style>
