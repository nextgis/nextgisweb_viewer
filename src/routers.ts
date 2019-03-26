import VueRouter from 'vue-router';
import MainPage from './MainPage/MainPage.vue';
import Login from './Login/Login.vue';
import store from './store';
// import ExampleOutsidePage from './ExampleOutsidePage.vue';

const router = new VueRouter({
  mode: 'history',
  // @ts-ignore
  // base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    // { path: '/page/:id', component: ExampleOutsidePage },
    { path: '/:id?', component: MainPage },
  ]
});

router.beforeEach((to, from, next) => {
  // store.dispatch('fetchWebGis');
  if (to.fullPath === '/') {
    if (!store.state.app.webGis) {
      next('/login');
    }
  }
  if (to.fullPath === '/login') {
    if (store.state.app.webGis) {
      next('/');
    }
  }
  next();
});

export default router;
