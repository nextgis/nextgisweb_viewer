import Vuex from 'vuex';
import { DefineActions, DefineGetters, DefineMutations } from 'vuex-type-helper';
import { WebGis } from './WebGis';
import router from '../../routers';

export interface State {
  name: string;
  webGis?: WebGis;
}

export interface Getters {
  name: string;
}

export interface Mutations {
  name: {
    name: string;
  };
  webGis: WebGis;
}

export interface Actions {
  name: {
    name: string;
  };
  webGis: WebGis;
}

const _state: State = {
  name: 'World',
  webGis: undefined
};

const _getters: DefineGetters<Getters, State> = {
  name: (state) => state.name
};

const _mutations: DefineMutations<Mutations, State> = {
  name(state, { name }) {
    state.name = name;
  },

  webGis(state, webGis) {
    state.webGis = webGis;
  }
};

const _actions: DefineActions<Actions, State, Mutations, Getters> = {
  name({ commit }, payload) {
    commit('name', payload);
  },
  webGis({commit}, webGis) {
    commit('webGis', webGis);
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
