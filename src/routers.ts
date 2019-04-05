import VueRouter from 'vue-router';
import MainPage from './MainPage/MainPage.vue';
import Login from './Login/Login.vue';
import store from './store';
import ResourcePage from './components/Resource/ResourcePage.vue';
import SearchPage from './components/Search/SearchPage.vue';
// import ExampleOutsidePage from './ExampleOutsidePage.vue';

const router = new VueRouter({
  mode: 'history',
  // @ts-ignore
  // base: process.env.BASE_URL || './',
  base: './',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    // { path: '/page/:id', component: ExampleOutsidePage },
    {
      path: '/:resource?', name: 'main', component: MainPage, children: [
        { path: '/', component: SearchPage },
        { path: 'view', component: ResourcePage },
      ]
    },
    {
      path: '*',
      redirect: '/login'
    }
  ]
});

router.beforeEach((to, from, next) => {
  // store.dispatch('fetchWebGis');
  if (to.fullPath !== '/login') {
    const webGis = store.state.app.webGis;
    if (!webGis) {
      next('/login');
    }
    // if (webGis && webGis.id !== to.params.webgis) {
    //   next('/login');
    // }
  }
  if (to.fullPath === '/login') {
    if (store.state.app.webGis) {
      next('/');
    }
  }
  next();
});

export default router;
