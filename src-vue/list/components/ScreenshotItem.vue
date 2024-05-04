<script setup lang="ts">
import {ref} from "vue";
import {ScreenshotInfo}    from "@/src/types";
import {getFromStoreLocal} from "@/src/util-ext";
import {toJpgDataUrl}      from "@/src/bg/image-data";
import {fullUrlToFilename} from "@/src/util";
import {dateFormatter}     from "./core";

const props = defineProps<{screenshot: ScreenshotInfo}>();

const {url, created, title, scd_id} = props.screenshot;
const src = ref();
getFromStoreLocal(scd_id).then(base64 => src.value = toJpgDataUrl(base64));


</script>

<template>
  <div data-comp="ScreenshotItem" class="screenshot-info" :data-hash="scd_id" :data-created="created">
    <h3 class="title" style="align-self: start; margin: 12px;">{{ title || fullUrlToFilename(url) }}</h3>
    <div class="url"  style="align-self: start; margin: 12px;">{{ url }}</div>
    <div class="created" style="align-self: start; margin: 12px;">{{ created ? dateFormatter(created) : "" }}</div>
    <img :src="src" :alt="title" :title="fullUrlToFilename(url)">
  </div>
</template>

<style scoped>

</style>
