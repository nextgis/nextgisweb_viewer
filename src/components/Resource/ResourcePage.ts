import { Vue, Component, Watch } from 'vue-property-decorator';

import { State, Action, Getter } from 'vuex-class';
import NgwMap, { LayerAdapter } from '@nextgis/ngw-map';
import { ResourceCls } from '@nextgis/ngw-connector';

import MapAdapter from '@nextgis/leaflet-map-adapter';
import 'leaflet/dist/leaflet.css';

import { ViewerResource } from '../../store/modules/ResourceItem';
import { WebGis } from '../../store/modules/WebGis';
import { WebMapLayerAdapter, WebMapAdapterOptions } from '@nextgis/ngw-kit';

const namespace: string = 'app';

const styleResources: ResourceCls[] = ['qgis_vector_style', 'mapserver_style', 'raster_style'];

@Component
export class ResourcePage extends Vue {
  @State('webGis', { namespace }) webGis!: WebGis;
  @Getter('resourceById', { namespace }) getResourceById!: (id: number) => ViewerResource | undefined;
  @Action('loadChildren', { namespace }) loadChildren!: (id: number) => Promise<ViewerResource[]>;

  ngwMap?: NgwMap;

  resource?: ViewerResource;

  isLoading = true;

  layerResourceId: number = 0;

  styles: ViewerResource[] = [];

  mounted() {
    this.ngwMap = new NgwMap(new MapAdapter(), {
      baseUrl: this.webGis.url,
      auth: this.webGis.auth,
      target: 'map',
      bounds: [0, -90, 180, 90],
      qmsId: [487, 'baselayer'],
      connector: this.webGis.connector,
    });
    this.isLoading = true;
    this.updateResource();
  }

  @Watch('$route')
  updateResource() {
    const params = this.$router.currentRoute.params;
    const resourceId = params && params.resource;
    if (resourceId) {
      const resource = this.getResourceById(Number(resourceId));
      this.resource = resource;
      this._updateMap();
    }
  }

  async fetch() {
    if (this.resource) {
      return this.loadChildren(this.resource.id);
    }
  }

  @Watch('layerResourceId')
  async showLayer() {
    const resource = this.styles.find((x) => x.id === this.layerResourceId);
    if (resource && this.ngwMap) {
      this.isLoading = true;
      this.ngwMap.removeLayers();
      let layer: LayerAdapter | undefined;
      if (resource.cls === 'vector_layer') {
        layer = await this.ngwMap.addNgwLayer({
          resourceId: resource.id,
          adapter: 'GEOJSON',
          adapterOptions: {
            paint: { fillOpacity: 0.5, stroke: true }
          }
        });
      } else if (styleResources.indexOf(resource.cls) !== -1) {
        layer = await this.ngwMap.addNgwLayer({
          resourceId: resource.id
        });
      } else if (resource.cls === 'webmap') {
        layer = await this.ngwMap.addLayer<'WEBMAP', WebMapAdapterOptions>(WebMapLayerAdapter, {
          webMap: this.ngwMap,
          resourceId: resource.id,
          baseUrl: this.webGis.url,
          connector: this.webGis.connector!
        });

      }
      if (layer) {
        if (layer.getExtent) {
          const extent = await layer.getExtent();
          if (extent) {
            this.ngwMap.fitBounds(extent);
          }
        } else {
          this.ngwMap.zoomToLayer(layer);
        }
      }
      this.isLoading = false;
    }
  }

  private async _updateMap() {
    await this.fetch();
    const resource = this.resource;
    this.styles = [];
    if (this.ngwMap && resource) {
      const resourcesWithStyles: ResourceCls[] = ['raster_layer', 'vector_layer'];
      if (resourcesWithStyles.indexOf(resource.cls) !== -1) {
        const children = resource._children;
        if (children && children.length > 0) {
          this.styles = [...children];
          if (resource.cls === 'vector_layer') {
            this.styles.push(resource);
          }
        } else {
          this.styles.push(resource);
        }
      } else {
        this.styles.push(resource);
      }
      if (this.styles.length) {
        this.layerResourceId = this.styles[0].id;
      }
    }
  }
}
