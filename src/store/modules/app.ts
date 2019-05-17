import Vue from 'vue';
import NgwConnector from '@nextgis/ngw-connector';
import {
  VuexModule,
  Module,
  MutationAction,
  Mutation,
  Action,
  getModule
} from 'vuex-module-decorators';
import router from '../../routers';
import store from '../';
import { WebGis } from './WebGis';
import { ViewerResource } from './ResourceItem';
import { findResource } from './utils';

import { AppState, TreeItemChildrenpdateOptions } from './interfaces';

@Module({ dynamic: true, store, name: 'user' })
class App extends VuexModule implements AppState {
  webGis: WebGis | null = null;

  get resourceById(): (id: number) => ViewerResource | undefined {
    return (id: number) => {
      const webGis = this.webGis;
      const resources = webGis && webGis.resources;
      if (resources) {
        return findResource(resources, id);
      }
    };
  }

  @MutationAction({ mutate: ['webGis'] })
  async setWebGis(webGis?: WebGis) {
    if (webGis) {
      const connector = new NgwConnector({
        baseUrl: webGis.url,
        auth: webGis.auth
      });
      const resources = await connector.get('resource.collection', null, { parent: 0 });
      let systemName;
      try {
        systemName = await connector.get('pyramid.system_name');
      } catch (er) {
        //
      }
      const existWebGis: WebGis = {
        ...webGis,
        meta: { systemName: systemName && systemName.full_name },
        connector,
        resources: resources.map((x) => x.resource)
      };
      router.push('/' + (webGis.id ? webGis.id : ''));
      return {webGis: existWebGis};
    } else {
      router.push('/login');
      return {webGis: undefined};
    }
  }

  @Action({commit: 'UPDATE_RESOURCE_CHILDREN'})
  async loadChildren(id: number) {
    const connector = this.webGis && this.webGis.connector;
    if (connector) {
      const collection = await connector.get('resource.collection', null, { parent: id });
      const children = collection.map((x) => x.resource) as ViewerResource[];
      return { id, children };
    }
  }

  @Mutation
  private UPDATE_RESOURCE_CHILDREN(opt: TreeItemChildrenpdateOptions) {
    const webGis = this.webGis;
    const resources = webGis && webGis.resources;
    if (resources) {
      const resourceInTree = findResource(resources, opt.id);
      if (resourceInTree) {
        Vue.set(resourceInTree, '_children', opt.children);
      }
    }
  }
}

export const appModule = getModule(App);

