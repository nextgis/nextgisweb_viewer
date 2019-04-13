<template>
  <v-content class="map-content">
    <v-layout justify-center row fill-height wrap>
      <v-flex>
        <div id="map"></div>
      </v-flex>
      <v-flex class="attribution-container" v-if="selectedFeature" xs12 sm6 md4>
        <v-list dense>
          <v-list-tile @click.stop="cleanSelected">
            <v-list-tile-action>
              <v-icon>mdi-close</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title header>Feature#{{selectedFeature.id}}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <div class="tabs-container-div">
          <v-tabs v-model="activeTab">
            <v-tab v-if="selectedFeature.fields" ripple>Fields</v-tab>
            <v-tab v-if="selectedFeature.extensions.attachment" ripple>Attachment</v-tab>
            <v-tab v-if="selectedFeature.extensions.description" ripple>Description</v-tab>

            <v-tab-item v-if="selectedFeature.fields">
              <v-card flat>
                <v-card-text>
                  <v-layout column fill-height>
                    <v-flex v-for="(f, i) in selectedFeature.fields" :key="i">
                      <v-text-field v-if="f" readonly :value="f" :label="i"></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item v-if="selectedFeature.extensions.attachment">
              <v-layout row wrap>
                <v-flex v-for="a in selectedFeature.extensions.attachment" :key="a.id" xs4 d-flex>
                  <v-card flat tile class="d-flex">
                    <v-img
                      :src="`${webGis.url}/api/resource/${resource.id}/feature/${selectedFeature.id}/attachment/${a.id}/image?size=300x300`"
                      :lazy-src="`${webGis.url}/api/resource/${resource.id}/feature/${selectedFeature.id}/attachment/${a.id}/image`"
                      aspect-ratio="1"
                      class="grey lighten-2"
                    >
                      <template v-slot:placeholder>
                        <v-layout fill-height align-center justify-center ma-0>
                          <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                        </v-layout>
                      </template>
                    </v-img>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-tab-item>

            <v-tab-item v-if="selectedFeature.extensions.description">
              <v-card flat>
                <v-card-text>{{ selectedFeature.extensions.description }}</v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs>
        </div>
      </v-flex>
    </v-layout>
  </v-content>
</template>

<script lang="ts">
export { ResourcePage as default } from "./ResourcePage";
</script>


<style lang="scss">
#map {
  width: 100%;
  height: 100%;
  z-index: 0;
}

.map-content {
  height: 100%;
  position: absolute;
  width: 100%;
}

// .map-wrapper {
//   min-height: 50%;
// }

.attribution-container {
  height: 100%;
}

.tabs-container-div {
  // position: absolute;
  height: 100%;
  width: 100%;

  .v-tabs {
    height: 100%;
  }

  .v-window {
    overflow: auto;
    position: absolute;
    height: calc(100% - 48px) !important;
    width: 100%;
  }
}
</style>
