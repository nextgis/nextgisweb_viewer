import { Vue, Component, Watch } from 'vue-property-decorator';

import { State, Action } from 'vuex-class';
import NgwMap from '@nextgis/ngw-map';

import MapAdapter from '@nextgis/leaflet-map-adapter';
import 'leaflet/dist/leaflet.css';

import { WebGis } from 'src/store/modules/WebGis';
import { ViewerResource } from 'src/store/modules/ResourceItem';
import { ResourceCls } from 'nextgisweb_frontend/packages/ngw-connector/src';

const namespace: string = 'app';

interface TreeItem {
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
  mapserver_style: 'mdi-palette-swatch',
  qgis_vector_style: 'mdi-palette-swatch',
  raster_style: 'mdi-palette-swatch',
  basemap_layer: 'mdi-map',
  raster_layer: 'mdi-image'
};

type Adapter = 'GEOJSON' | 'NGW';

const allowedResources: { [key in ResourceCls]?: Adapter } = {
  vector_layer: 'GEOJSON',
  mapserver_style: 'NGW',
  qgis_vector_style: 'NGW',
  raster_style: 'NGW'
};

@Component
export class MainPage extends Vue {
  @State('webGis', { namespace }) webGis?: WebGis;
  @Action('loadChildren', { namespace }) loadChildren!: (id: number) => Promise<ViewerResource[]>;

  active: string[] = [];

  open: string[] = [];

  drawer = null;

  ngwMap?: NgwMap;

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

  mounted() {
    this.ngwMap = new NgwMap(new MapAdapter(), {
      target: 'map',
      bounds: [0, -90, 180, 90],
      qmsId: [487, 'baselayer'],
    });
  }


  getChildren(resource: ViewerResource) {
    const children = resource._children ? resource._children : [];
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
    if (allowedResources[r.cls]) {
      item.forMap = true;
    }
    return item;
  }
}
