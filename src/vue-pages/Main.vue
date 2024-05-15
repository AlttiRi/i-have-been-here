<script setup lang="ts">
import NavBar from "@/vue-pages/header/NavBar.vue";
</script>

<template>
  <div data-comp="Main" id="main" class="container">
    <NavBar/>
    <RouterView/>
  </div>
</template>

<style scoped>

</style>
