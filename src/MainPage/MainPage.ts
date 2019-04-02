import { Vue, Component, Watch } from 'vue-property-decorator';

import { State, Action } from 'vuex-class';
import NgwMap from '@nextgis/ngw-map';

import MapAdapter from '@nextgis/leaflet-map-adapter';
import 'leaflet/dist/leaflet.css';

import { WebGis } from 'src/store/modules/WebGis';
import { ViewerResource } from 'src/store/modules/ResourceItem';

const namespace: string = 'app';

interface TreeItem {
  id: string;
  name: string;
  children?: TreeItem[];
}

export interface Item {
  id: string;
  name: string;
}

@Component
export class MainPage extends Vue {
  @State('webGis', { namespace }) webGis?: WebGis;
  @Action('loadChildren', { namespace }) loadChildren!: (id: number) => Promise<ViewerResource[]>;

  active: string[] = [];

  open: string[] = [];

  drawer = null;

  ngwMap?: NgwMap;

  get items(): Item[] {
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
      id: String(r.id),
      name: String(r.display_name),
    };
    if (r.children) {
      item.children = this.getChildren(r);
    }
    return item;
  }
}
