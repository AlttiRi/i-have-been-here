<template>
  <div data-comp="Tabs" id="tabs" class="container">
    <Header/>
    <hr>
    <TabsList v-if="activePage === 'list'"/>
    <TabsJson v-if="activePage === 'json'"/>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import Header   from "./Header.vue";
import TabsList from "./TabsList.vue";
import TabsJson from "./TabsJson.vue";

const activePage = ref(new URL(location.href).searchParams.get("page") as "list" | "json");
</script>

<style>

</style>
