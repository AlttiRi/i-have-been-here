<script setup lang="ts">
import Header         from "../../Header.vue";
import VisitsPage     from "./VisitsPage.vue";
import ScreenshotPage from "./ScreenshotPage.vue";
import Controls       from "./Controls.vue";

import {ref} from "vue";
const activePage = ref(new URL(location.href).searchParams.get("page") as "visits" | "screens");
</script>

<template>
  <div data-comp="List" id="list">
    <Header/>
    <Controls :activePage/>
    <VisitsPage     v-if="activePage === 'visits'"/>
    <ScreenshotPage v-if="activePage === 'screens'"/>
  </div>
</template>

<style>

</style>
