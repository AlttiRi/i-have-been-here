<script setup lang="ts">
import {ref} from "vue";
import {PagePaths} from "@/page-paths";


const activePage = ref(new URL(location.href).searchParams.get("page") as "list" | "json");
</script>

<template>
  <header data-comp="Header" class="d-flex justify-content-center py-3 pb-0">
    <ul class="nav nav-pills px-3">
      <li class="nav-item"><a :href="PagePaths.visits" class="nav-link" id="visits-btn">📃 Visits</a></li>
    </ul>
    <ul class="nav nav-pills px-3">
      <li class="nav-item"><a :href="PagePaths.options" class="nav-link" id="opt-btn">⚙ Settings</a></li>
    </ul>
    <ul class="nav nav-pills px-3">
      <li class="nav-item"><a :href="PagePaths.tabs_list" class="nav-link" id="list-btn"
          :class="{
            active: activePage === 'list',
          }"
      >Opened Tabs</a></li>
      <li class="nav-item"><a :href="PagePaths.tabs_json" class="nav-link" id="json-btn"
          :class="{
            active: activePage === 'json',
          }"
      >Opened Tabs JSON</a></li>
    </ul>
  </header>
</template>

<style scoped>
header {
  user-select: none;
}
</style>
