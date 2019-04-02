import Vuex from 'vuex';
import { DefineActions, DefineGetters, DefineMutations } from 'vuex-type-helper';
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
}

export interface Mutations {
  webGis: WebGis;
  updateResourceChildren: TreeItemChildrenpdateOptions;
}

export interface Actions {
  webGis: WebGis;
  loadChildren: number;
}

const _state: State = {
  webGis: undefined
};

const _getters: DefineGetters<Getters, State> = {
  webGis: (state) => state.webGis
};

const _mutations: DefineMutations<Mutations, State> = {

  webGis(state, webGis) {
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

const _actions: DefineActions<Actions, State, Mutations, Getters> = {
  async webGis({ commit }, webGis) {
    const connector = new NgwConnector({
      baseUrl: webGis.url,
      auth: webGis.auth
    });
    const resources = await connector.get('resource.collection', null, { parent: 0 });
    const existWebGis: WebGis = {
      ...webGis,
      connector,
      resources: resources.map((x) => x.resource)
    };
    commit('webGis', existWebGis);
    router.push('/');
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

export const {
  mapState,
  mapGetters,
  mapMutations,
  mapActions
} = Vuex.createNamespacedHelpers<State, Getters, Mutations, Actions>('app');

export default {
  namespaced: true,
  state: _state,
  getters: _getters,
  mutations: _mutations,
  actions: _actions
};
