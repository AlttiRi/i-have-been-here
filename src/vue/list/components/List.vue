<script setup lang="ts">
import Header         from "./Header.vue";
import VisitsPage     from "./VisitsPage.vue";
import ScreenshotPage from "./ScreenshotPage.vue";
import Controls       from "./Controls.vue";
</script>

<template>
  <div data-comp="List" id="list">
    <Header/>
    <hr>
    <Controls/>
    <hr>
    <VisitsPage/>
    <hr>
    <ScreenshotPage/>
  </div>
</template>

<style>

</style>
