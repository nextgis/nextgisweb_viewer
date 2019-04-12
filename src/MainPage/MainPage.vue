<template>
  <div id="app">
    <v-app id="inspire">
      <v-navigation-drawer
        :clipped="$vuetify.breakpoint.lgAndUp"
        :open="open"
        :load-children="loadChildren"
        v-model="drawer"
        dark
        style="background:#0070c5"
        fixed
        app
      >
        <v-text-field
          v-model="search"
          :loading="searchLoading"
          solo
          label="Search by full name"
          clearable
          class="pl-3 pr-3 pt-3"
          hide-details
        ></v-text-field>
        <v-treeview
          v-if="items"
          :load-children="fetch"
          :active.sync="active"
          :items="items"
          :open="open"
          activatable
          open-on-click
          transition
          @update:open="onOpen"
          class="pt-3 pb-3"
          expand-icon="mdi-chevron-down"
          loading-icon="mdi-loading"
        >
          <template slot="prepend" slot-scope="{ item }">
            <span>
              <v-icon v-if="item.icon">{{item.icon}}</v-icon>
            </span>
          </template>
          <template slot="label" slot-scope="{ item }">
            <span>{{item.name}}</span>
          </template>
        </v-treeview>
      </v-navigation-drawer>

      <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="#e5eef7" app fixed>
        <v-toolbar-title class="ml-0 pl-0">
          <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
          <!-- <router-link to="/"><logo></logo></router-link> -->
        </v-toolbar-title>
        <span class="title ml-3">{{webGis ? webGis.meta.systemName || webGis.id : 'loading...'}}</span>
        <v-spacer></v-spacer>
        <span class="title mr-2">{{webGis && webGis.auth && webGis.auth.login || 'guest'}}</span>
        <v-btn icon @click="logout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </v-toolbar>

      <v-content>
        <router-view v-if="webGis"></router-view>
      </v-content>
    </v-app>
  </div>
</template>

<script lang="ts">
export { MainPage as default } from "./MainPage";
</script>


<style lang="scss">
code:after,
kbd:after,
code:before,
kbd:before {
  content: "" !important;
  letter-spacing: 0 !important;
}

.header {
  backface-visibility: hidden;
  background-color: #e5eef7;
  border-bottom: 1px solid #d3e3f2;
  color: rgba(0, 0, 0, 0.87);
  font-size: 14px;
  font-weight: 400;
  height: 43px;
  left: 0;
  line-height: 43px;
  min-height: 43px;
  padding-left: 0;
  padding-right: 0;
  position: fixed;
  right: 0;
  top: 0;
  white-space: nowrap;
  width: 100%;
  z-index: 40;
}

.nowrap {
  white-space: nowrap !important;
}

#map {
  width: 100%;
  height: 100%;
}
</style>
