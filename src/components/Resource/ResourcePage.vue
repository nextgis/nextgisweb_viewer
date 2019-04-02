<template>
  <v-layout justify-center column fill-height>
    <v-flex style="flex-grow: 0;" v-if="styles.length > 1">
      <v-radio-group v-model="layerResourceId" row>
        <v-radio v-for="s in styles" :key="s.id" :label="s.display_name" :value="s.id" :disabled="isLoading"></v-radio>
      </v-radio-group>
      <hr>
    </v-flex>
    <v-flex style="flex-grow: 1;">
      <div id="map"></div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
export { ResourcePage as default } from "./ResourcePage";
</script>


<style lang="scss">
#map {
  width: 100%;
  height: 100%;
}
</style>
