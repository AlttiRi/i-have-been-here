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
.card {
  border-radius: 0;
}
.hidden {
  opacity: 0!important;
  pointer-events: none!important;
}
.pointer-event-on {
  pointer-events: all;
}
.pointer-event-off {
  pointer-events: none;
}
</style>
