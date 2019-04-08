import VueRouter from 'vue-router';
import MainPage from './MainPage/MainPage.vue';
import Login from './Login/Login.vue';
import store from './store';
import ResourcePage from './components/Resource/ResourcePage.vue';
import SearchPage from './components/Search/SearchPage.vue';
import { WebGis } from './store/modules/WebGis';
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
      path: '/:webgis/:resource?', component: MainPage, children: [
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

// router.beforeEach((to, from, next) => {
//   // store.dispatch('fetchWebGis');
//   // const webGis: WebGis = store.state.app.webGis;
//   // if (to.fullPath !== '/login') {
//   //   if (!webGis) {
//   //     next('/login');
//   //   } else {
//   //     if (to.params.webgis !== undefined) {
//   //       if (webGis.id !== to.params.webgis) {
//   //         next('/login');
//   //       }
//   //     } else {
//   //       next('/' + webGis.id);
//   //     }
//   //   }
//   // }
//   // if (to.fullPath === '/login') {
//   //   if (webGis && webGis.id) {
//   //     next('/' + webGis.id);
//   //   }
//   // }
//   next();
// });

export default router;
