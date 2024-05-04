<template>
  <div data-comp="Popup" id="popup" style="width: 320px;">
    <TopControls/>
    <Screenshot/>
    <BottomInfo/>
  </div>
</template>

<script setup lang="ts">
import TopControls from "./TopControls.vue";
import Screenshot  from "./Screenshot.vue";
import BottomInfo  from "./BottomInfo.vue";
</script>

<style>
img#faviconElem {
  height: 22px;
  width: 22px
}
img#faviconElem[src="#"] {
  display: none;
}
.favicon-wrap {
  display: flex;
  margin: 0;
}
.info {
  max-width: 320px;
}
#titleElem {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.bar {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  padding-top:  0.5rem;
}
#urlElem {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding-left:  0.5rem;
}
#image-wrap {
  overflow: hidden;
}
.hidden {
  opacity: 0!important;
  pointer-events: none!important;
}
.screenshot-part:not(:hover) button {
  opacity: 0;
  pointer-events: none;
}

#screenshotControls:not(:hover) #addScreenshotBtn {
  opacity: 0;
  pointer-events: none;
}
.pointer-event-on {
  pointer-events: all;
}
.pointer-event-off {
  pointer-events: none;
}

.img-thumbnail {
  padding: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
}

.card {
  border-radius: 0;
}
</style>
