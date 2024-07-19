<script setup lang="ts">
import {ref} from "vue";
import {localDateTime}     from "@alttiri/util-js";
import {fullUrlToFilename} from "@/util";
import {getFromStoreLocal} from "@/util-ext";
import {toJpgDataUrl}      from "@/bg/image-data";
import {ScreenshotInfo}    from "@/types";
import {allImagesReady}    from "./core-list";

const props = defineProps<{screenshot: ScreenshotInfo}>();

const {url, created, title, scd_id} = props.screenshot;
const src = ref();
getFromStoreLocal(scd_id).then(base64 => src.value = toJpgDataUrl(base64));


let onImageReady: (e: Event) => void;
allImagesReady.value.push(new Promise(resolve => {
  onImageReady = resolve;
}));
</script>

<template>
  <div data-comp="ScreenshotItem" class="screenshot-item" :data-hash="scd_id" :data-created="created">
    <div class="info">
      <h3 class="title" style="align-self: start; margin: 12px;">{{ title || fullUrlToFilename(url) }}</h3>
      <h5 class="url"  style="align-self: start; margin: 12px;">
        <a :href="url" rel="noreferrer noopener" target="_blank" >{{ url }}</a>
      </h5>
      <div class="created" style="align-self: start; margin: 12px;">{{ created ? localDateTime(created) : "" }}</div>
    </div>
    <img :src="src" :alt="title" :title=" title || fullUrlToFilename(url)"
         @load="onImageReady" @error="onImageReady"
    >
  </div>
</template>

<style scoped>
.info {
  padding-left: 12px;
  margin-left: 1px;
}
.screenshot-item:hover .info {
  padding-left: 9px;
  border-left: 3px #0d6efd solid;
}
a:visited {
  color: #0a53be;
}
a {
  text-decoration: none;
  overflow-wrap: break-word;
}
</style>
