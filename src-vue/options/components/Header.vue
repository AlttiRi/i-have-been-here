<script setup lang="ts">
import {PagePaths} from "@/src/page-paths";
</script>

<template>
  <header class="d-flex justify-content-center py-3 pb-0">
    <ul class="nav nav-pills px-3">
      <li class="nav-item"><a :href="PagePaths.visits" class="nav-link" id="visits-btn">📃 Visits</a></li>
    </ul>
    <ul class="nav nav-pills px-3">
      <li class="nav-item"><a :href="PagePaths.options" class="nav-link active" id="opt-btn">⚙ Settings</a></li>
    </ul>
    <ul class="nav nav-pills px-3">
      <li class="nav-item"><a :href="PagePaths.tabs_list" class="nav-link" id="list-btn">Opened Tabs</a></li>
      <li class="nav-item"><a :href="PagePaths.tabs_json" class="nav-link" id="json-btn">Opened Tabs JSON</a></li>
    </ul>
  </header>
</template>

<style scoped>
header {
  user-select: none;
}
</style>
