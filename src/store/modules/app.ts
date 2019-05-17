import Vuex from 'vuex';
import { DefineActions, DefineGetters, DefineMutations } from 'vuex-type-helper';
import { VuexModule, Module } from 'vuex-module-decorators';
import { WebGis } from './WebGis';
import router from '../../routers';
import { ViewerResource } from './ResourceItem';
import NgwConnector from '@nextgis/ngw-connector';
import { findResource } from './utils';
import Vue from 'vue';

export interface State {
  webGis?: WebGis;
}

interface TreeItemChildrenpdateOptions {
  id: number;
  children: ViewerResource[];
}

export interface Getters {
  webGis: WebGis | undefined;
  resourceById: (id: number) => ViewerResource | undefined;
}

export interface Mutations {
  webGis: WebGis | undefined;
  updateResourceChildren: TreeItemChildrenpdateOptions;
}

export interface Actions {
  setWebGis: WebGis | undefined;
  loadChildren: number;
}

const _state: State = {
  webGis: undefined
};

const _getters: DefineGetters<Getters, State> = {
  webGis: (state) => state.webGis,

  resourceById: (state) => (id: number) => {
    const webGis = state.webGis;
    const resources = webGis && webGis.resources;
    if (resources) {
      return findResource(resources, id);
    }
  }
};

const _actions: DefineActions<Actions, State, Mutations, Getters> = {
  async setWebGis({ commit }, webGis) {
    if (webGis) {
      const connector = new NgwConnector({
        baseUrl: webGis.url,
        auth: webGis.auth
      });
      // const main = await connector.get('resource.item', null, { id: 0 });
      const resources = await connector.get('resource.collection', null, { parent: 0 });
      let systemName;
      try {
        systemName = await connector.get('pyramid.system_name');
      } catch (er) {
        //
      }
      const existWebGis: WebGis = {
        ...webGis,
        // meta: {},
        meta: { systemName: systemName && systemName.full_name },
        connector,
        resources: resources.map((x) => x.resource)
      };
      commit('webGis', existWebGis);
      // router.push('/');
      router.push('/' + (webGis.id ? webGis.id : ''));
    } else {
      commit('webGis', undefined);
      router.push('/login');
    }
  },

  async loadChildren({ commit, state }, id: number) {
    const connector = state.webGis && state.webGis.connector;
    if (connector) {
      const collection = await connector.get('resource.collection', null, { parent: id });
      const children = collection.map((x) => x.resource) as ViewerResource[];
      commit('updateResourceChildren', { id, children });
      return children;
    }
  }
};

const _mutations: DefineMutations<Mutations, State> = {

  webGis(state, webGis?) {
    state.webGis = webGis;
  },

  updateResourceChildren(state, { id, children }) {
    const webGis = state.webGis;
    const resources = webGis && webGis.resources;
    if (resources) {
      const resourceInTree = findResource(resources, id);
      if (resourceInTree) {
        Vue.set(resourceInTree, '_children', children);
      }
    }
  }
};

export const {
  mapState,
  mapGetters,
  mapMutations,
  mapActions
} = Vuex.createNamespacedHelpers<State, Getters, Mutations, Actions>('app');


// export default {
//   namespaced: true,
//   state: _state,
//   getters: _getters,
//   mutations: _mutations,
//   actions: _actions
// };

@Module
export default class App extends VuexModule {

}
