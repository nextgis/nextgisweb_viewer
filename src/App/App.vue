<template>
  <v-app id="inspire">
    <router-view></router-view>
  </v-app>
</template>

<script lang="ts">
export { App as default } from './App';
</script>


<style lang="scss">
* {
  padding: 0;
  margin: 0;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden !important;
}
</style>
