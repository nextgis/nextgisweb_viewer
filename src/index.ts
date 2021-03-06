import Vue from 'vue';
import store from './store';
import router from './routers';
import App from './App/App.vue';
import VueRouter from 'vue-router';
// @ts-ignore
import Vuetify from 'vuetify/lib';
import 'vuetify/src/stylus/app.styl';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Vuetify, {
  iconfont: 'mdi'
});
Vue.use(VueRouter);

const app = new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
  methods: {
    goTo(elementId: string, options?: any) {
      // @ts-ignore
      this.$vuetify.goTo('#' + elementId.replace('#', ''), options);
      window.location.hash = elementId;
    }
  }
});

// declare global {
//   interface Window {
//     version: string;
//   }
// }

// window.version = version;
