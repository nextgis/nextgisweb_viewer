<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Connect to WebGIS</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-chip
                v-if="loginErrorMessage"
                label
                outline
                color="red"
                class="top-error-message"
              >{{loginErrorMessage}}</v-chip>

              <v-form @submit="onGoBtnClick" onSubmit="return false;">
                <v-switch v-model="fromCloud">
                  <template v-slot:label>
                    <v-icon class="pr-1">mdi-cloud</v-icon>From NextGIS Web cloud
                  </template>
                </v-switch>

                <v-layout v-if="fromCloud" align-center justify-space-between row fill-height>
                  <v-btn @click="protocolClick++">{{protocol}}</v-btn>
                  <v-text-field
                    v-model="urlStr"
                    ref="webgis-name"
                    name="webgis-name"
                    label="WebGIS name"
                    type="text"
                  ></v-text-field>

                  <v-chip>.{{cloudUrl}}</v-chip>
                </v-layout>

                <v-text-field
                  v-else
                  v-model="urlStr"
                  ref="url"
                  name="url"
                  label="WebGIS URL"
                  type="text"
                  :rules="[rules.validUrl]"
                ></v-text-field>

                <v-switch v-model="guest" label="As guest"></v-switch>
                <div v-if="!guest">
                  <v-text-field v-model="login" ref="login" name="login" label="Login" type="text"></v-text-field>
                  <v-text-field
                    v-model="password"
                    ref="password"
                    name="password"
                    label="Password"
                    id="password"
                    type="password"
                  ></v-text-field>
                </div>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn v-if="isLoading" @click="onGoBtnClick" color="primary" disabled>
                <v-progress-circular indeterminate></v-progress-circular>
              </v-btn>
              <v-btn v-else @click="onGoBtnClick" color="primary" :disabled="!isValid">Go</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script lang="ts">
export { Login as default } from "./Login";
</script>


<style lang="scss">
.top-error-message {
  width: 100%;
}
</style>
