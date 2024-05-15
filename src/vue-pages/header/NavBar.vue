<script setup lang="ts">
function onAnchorClick(event: MouseEvent) { // use capture!
  const target = event.target as HTMLElement;
  if (target.tagName === "A" && target.classList.contains("active")) {
    location.reload();
  }
}
</script>

<template>
  <div data-comp="NavBar" class="container nav-header">
    <header class="d-flex justify-content-center py-3 pb-0" @click.capture="onAnchorClick">

      <ul class="nav nav-pills px-2">
        <li class="nav-item">
          <RouterLink :to="{name: 'list.visits'}"
                      id="list_visits-btn"
                      class="nav-link"
          >📃 Visits</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink :to="{name: 'list.screens'}"
                      id="list_screens-btn"
                      class="nav-link"
          >🖼 Screens</RouterLink>
        </li>
      </ul>

      <ul class="nav nav-pills px-2">
        <li class="nav-item">
          <RouterLink :to="{name: 'settings'}"
                      id="settings-btn"
                      class="nav-link"
          >⚙ Settings</RouterLink>
        </li>
      </ul>

      <ul class="nav nav-pills px-2">
        <li class="nav-item">
          <RouterLink :to="{name: 'tabs.list'}"
                      id="tabs_list-btn"
                      class="nav-link"
          >Opened Tabs</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink :to="{name: 'tabs.json'}"
                      id="tabs_json-btn"
                      class="nav-link"
          >Opened Tabs JSON</RouterLink>
        </li>
      </ul>

    </header>
    <hr>
  </div>
</template>

<style scoped>
.nav-header {
  user-select: none;
  background-color: white;

  position: sticky;
  top: 0;
  z-index: 1;
}
.nav-link {
  margin-right: 4px;
}
</style>
