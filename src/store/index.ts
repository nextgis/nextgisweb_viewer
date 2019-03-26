import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';

Vue.use(Vuex);
// @ts-ignore
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    app
  },
  strict: debug,
});
