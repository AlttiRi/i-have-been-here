<script setup lang="ts">
import {PagePaths} from "@/page-paths";

const sp = new URL(location.href).searchParams;
const isTabs       = location.pathname.endsWith("tabs.html");
const isTabsList   = isTabs && sp.get("page") === "list";
const isTabsJson   = isTabs && sp.get("page") === "json";
const isSettings   = location.pathname.endsWith("settings.html");
const isList       = location.pathname.endsWith("list.html");
const isListVisits = isList && sp.get("page") === "visits";


</script>

<template>
  <header data-comp="Header" class="d-flex justify-content-center py-3 pb-0">
    <ul class="nav nav-pills px-3">
      <li class="nav-item">
        <a :href="PagePaths.list_visits" id="list_visits-btn"
           :class="{ active: isListVisits }" class="nav-link"
        >📃 Visits</a>
      </li>
    </ul>
    <ul class="nav nav-pills px-3">
      <li class="nav-item">
        <a :href="PagePaths.settings" id="settings-btn"
           :class="{ active: isSettings }" class="nav-link"
        >⚙ Settings</a>
      </li>
    </ul>
    <ul class="nav nav-pills px-3">
      <li class="nav-item">
        <a :href="PagePaths.tabs_list" id="tabs_list-btn"
           :class="{ active: isTabsList }" class="nav-link"
        >Opened Tabs</a>
      </li>
      <li class="nav-item">
        <a :href="PagePaths.tabs_json" id="tabs_json-btn"
           :class="{ active: isTabsJson }" class="nav-link"
        >Opened Tabs JSON</a>
      </li>
    </ul>
  </header>
</template>

<style scoped>
header {
  user-select: none;
}
</style>
