import Vuex from 'vuex';
import { DefineActions, DefineGetters, DefineMutations } from 'vuex-type-helper';
import { WebGis } from './WebGis';
import router from '../../routers';
import NgwConnector from '@nextgis/ngw-connector';

export interface State {
  webGis?: WebGis;
}

export interface Getters {
  webGis: WebGis | undefined;
}

export interface Mutations {
  webGis: WebGis;
}

export interface Actions {
  webGis: WebGis;
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
      resources
    };
    commit('webGis', existWebGis);
    router.push('/');
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
