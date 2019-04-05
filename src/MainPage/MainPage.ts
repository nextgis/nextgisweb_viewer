import { Vue, Component, Watch } from 'vue-property-decorator';

import NgwMap from '@nextgis/ngw-map';

import { WebGis } from 'src/store/modules/WebGis';
import { ViewerResource } from 'src/store/modules/ResourceItem';
import { ResourceCls } from 'nextgisweb_frontend/packages/ngw-connector/src';


import { namespace } from 'vuex-class';
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

const blockedTreeCls: ResourceCls[] = ['webmap', 'vector_layer', 'raster_layer'];

@Component
export class MainPage extends Vue {
  @State webGis?: WebGis;
  @Action loadChildren!: (id: number) => Promise<ViewerResource[]>;
  @Action setWebGis!: (webGis?: WebGis) => any;

  active: string[] = [];

  open: string[] = [];

  drawer = null;

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

  logout() {
    this.setWebGis();
  }

  @Watch('active')
  onActiveChange() {
    const active = this.active[0];
    if (active) {
      this.$router.push({ path: `/${active}/view` });
    } else {
      this.$router.push({ path: `/` });
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
}
