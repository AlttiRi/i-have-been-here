<script setup lang="ts">
import {ignoreFilter, onlyFilter} from "./core";


function clearOnly(event: MouseEvent) {
  event.preventDefault();
  onlyFilter.value = "";
}
function clearIgnore(event: MouseEvent) {
  event.preventDefault();
  ignoreFilter.value = "";
}

</script>

<template>
<div data-comp-part="Filters#1" class="col-12">
  <label style="display: contents;">
    <span class="input-group">
        <span class="input-group-text" id="only-filter-text" @contextmenu="clearOnly">Only</span>
        <input type="text" class="form-control" id="only-filter" placeholder="" v-model="onlyFilter">
    </span>
  </label>
</div>
<div data-comp-part="Filters#2" class="col-12">
  <label style="display: contents;">
    <span class="input-group">
        <span class="input-group-text" id="ignore-filter-text" @contextmenu="clearIgnore">Ignore</span>
        <input type="text" class="form-control" id="ignore-filter" placeholder="" v-model="ignoreFilter">
    </span>
  </label>
</div>
</template>

<style scoped>

</style>
