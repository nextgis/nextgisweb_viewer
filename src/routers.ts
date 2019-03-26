import VueRouter from 'vue-router';
import MainPage from './MainPage/MainPage.vue';
// import ExampleOutsidePage from './ExampleOutsidePage.vue';

export const router = new VueRouter({
  mode: 'history',
  routes: [
    // { path: '/page/:id', component: ExampleOutsidePage },
    { path: '/:id?', component: MainPage },
  ]
});
