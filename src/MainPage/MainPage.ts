import { Vue, Component, Watch } from 'vue-property-decorator';

import { WebGis, createUrlFromWebGisName } from '../store/modules/WebGis';
import { ViewerResource } from '../store/modules/ResourceItem';
import { ResourceCls } from '@nextgis/ngw-connector';


import { namespace } from 'vuex-class';
import { findResource } from '../store/modules/utils';
export const { Action, Getter, State } = namespace('app');

export interface TreeItem {
  id: number;
  name: string;
  children?: TreeItem[];
  cls?: ResourceCls;
  icon?: string;
  forMap?: boolean;
}

const clsIconAliases: { [key in ResourceCls]?: string } = {
  webmap: 'mdi-layers',
  resource_group: 'mdi-folder',
  vector_layer: 'mdi-vector-square',
  raster_layer: 'mdi-image',
  mapserver_style: 'mdi-palette-swatch',
  qgis_vector_style: 'mdi-palette-swatch',
  raster_style: 'mdi-palette-swatch',
  basemap_layer: 'mdi-map',
};

@Component
export class MainPage extends Vue {
  @State webGis?: WebGis;
  @Action loadChildren!: (id: number) => Promise<ViewerResource[]>;
  @Action setWebGis!: (webGis?: WebGis) => any;

  active: string[] = [];

  open: string[] = [];

  drawer = null;

  query: any = null;

  get items(): TreeItem[] {
    if (this.webGis) {
      const resources = this.webGis.resources;
      if (resources) {
        return resources.map((x) => {
          return this._resourceToTreeItem(x);
        });
      }
    }
    return [];
  }

  async created() {
    const params = this.$router.currentRoute.params;
    this.query = this.$router.currentRoute.query;
    if (params.webgis) {
      const currentGisId = this.webGis && this.webGis.id;
      const resId = Number(params.resource);
      if (currentGisId !== params.webgis) {
        await this.login({
          id: params.webgis,
          url: createUrlFromWebGisName(params.webgis)
        });
        if (this.webGis && resId) {
          const exist = this.webGis.resources ? findResource(this.webGis.resources, resId) : false;
          if (!exist) {
            await this._getTopParent(resId);
            this.active = [String(resId)];
          }
        }
      }
    }
  }

  async login(webGis: WebGis) {
    try {
      await this.setWebGis(webGis);
    } catch (er) {
      this.$router.push('/login');
    }
  }

  logout() {
    this.setWebGis();
  }

  @Watch('active')
  onActiveChange() {
    const id = this.webGis && this.webGis.id;
    if (id) {
      const active = this.active[0];
      if (active) {
        const path = `/${id}/${active}/view`;
        if (this.$router.currentRoute.path !== path) {
          this.$router.push({ path, query: this.query });
        }
      } else {
        this.$router.push(`/${id}/`);
      }
      this.query = null;
    }
  }

  getChildren(resource: ViewerResource) {
    const children = resource._children ? [...resource._children] : [];
    if (resource.cls === 'vector_layer' && children.length) {
      children.push({
        ...resource,
        display_name: resource.display_name + '-vector',
        children: false
      });
    }
    return children.map((x) => this._resourceToTreeItem(x));
  }

  onOpen(data: string[]) {
    this.open = data;
  }

  fetch(e: TreeItem) {
    return this.loadChildren(Number(e.id));
  }

  private _resourceToTreeItem(resource: ViewerResource) {
    const r = resource;

    const item: TreeItem = {
      id: r.id,
      name: String(r.display_name),
      cls: r.cls,
      icon: clsIconAliases[r.cls]
    };
    if (r.children) {
      item.children = this.getChildren(r);
    }
    return item;
  }

  private async _getTopParent(id: number) {
    if (this.webGis) {
      const connector = this.webGis.connector;
      if (connector) {
        let parent;
        const parents = [];
        while (!parent) {
          try {
            const resource = await connector.get('resource.item', null, { id });
            if (this.webGis.resources) {
              id = resource.resource.parent.id;
              if (id) {
                parents.push(id);
                parent = findResource(this.webGis.resources, id);
              } else {
                break;
              }
            }
          } catch (er) {
            break;
          }
        }
        if (parent) {
          for (const p of parents.reverse()) {
            await this.loadChildren(Number(p));
          }
          this.open = parents.map(x => String(x));
        }
      }
    }
  }
}
