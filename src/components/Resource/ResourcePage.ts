import { Vue, Component, Watch } from 'vue-property-decorator';

import NgwMap, { VectorLayerAdapter } from '@nextgis/ngw-map';
import { CancelablePromise } from '@nextgis/ngw-connector';

import MapAdapter from '@nextgis/leaflet-map-adapter';
import 'leaflet/dist/leaflet.css';

import { ViewerResource } from '../../store/modules/ResourceItem';
import { Feature } from 'geojson';
import { Route } from 'vue-router';

import { appModule } from '../../store/modules/app';

@Component
export class ResourcePage extends Vue {
  ngwMap?: NgwMap;

  resource?: ViewerResource;

  isLoading = true;
  // activeTab: 'fields' | 'attachment' | 'description' = 'fields';
  activeTab = '0';

  selectedFeature: any = null;

  vectorLayerId: string | undefined = undefined;

  getFeaturePromise?: CancelablePromise<any>;

  get webGis() { return appModule.webGis; }

  mounted() {
    if (this.webGis) {
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
  }

  @Watch('$route')
  updateResource(from?: Route, to?: Route) {
    if (from && to && from.path === to.path) {
      return;
    }
    const currentRoute = this.$router.currentRoute;
    const params = currentRoute.params;
    const resourceId = params && params.resource;
    const tab = currentRoute.query.tab as string;
    this.activeTab = tab || this.activeTab;
    this.selectedFeature = null;

    if (resourceId) {
      const resource = appModule.resourceById(Number(resourceId));
      this.resource = resource;
      this.showLayer();
    }

  }

  @Watch('activeTab')
  onTabChange() {
    this._updateQuery();
  }

  async showLayer() {
    const resource = this.resource;
    if (resource && this.ngwMap) {
      this.isLoading = true;
      this.ngwMap.removeOverlays();
      const layer = await this.ngwMap.addNgwLayer({
        resourceId: resource.id,
        adapterOptions: {
          paint: { fillOpacity: 0.5, stroke: true },
          selectedPaint: { fillOpacity: 0.8, stroke: true, radius: 10 },
          selectable: true,
        }
      });

      if (layer && 'getSelected' in layer) {
        const vectorLayer = layer as VectorLayerAdapter;
        this.vectorLayerId = this.ngwMap.getLayerId(layer);
        this.ngwMap.emitter.on('layer:click', (e) => {
          if (vectorLayer.getSelected && e.layer.id === vectorLayer.id) {
            const selected = vectorLayer.getSelected();
            const features: Feature[] = [];
            selected.forEach((x) => {
              if (x.feature) {
                features.push(x.feature);
              }
            });
            this._setSelected(features);
          }
        });
        const feature = this.$router.currentRoute.query.feature;
        if (feature && vectorLayer.select) {
          vectorLayer.select((x) => {
            // @ts-ignore
            return x.feature.id === Number(feature);
          });
          this._setSelected([{
            // @ts-ignore
            id: feature
          }]);
        }
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

  cleanSelected() {
    const ngwMap = this.ngwMap;
    if (ngwMap && this.vectorLayerId) {
      ngwMap.unSelectLayer(this.vectorLayerId);
    }
    this._setSelected([]);
  }

  private async _setSelected(features: Feature[]) {
    const feature = features[0];
    const resourceId = this.resource && this.resource.id;
    const connector = this.webGis && this.webGis.connector;
    if (this.getFeaturePromise) {
      // this.getFeaturePromise;
    }
    if (feature && connector && resourceId) {
      // @ts-ignore
      const fid: number = feature.id;
      this.getFeaturePromise = undefined;
      this.getFeaturePromise = connector.get('feature_layer.feature.item', null, {
        id: resourceId,
        fid
      });
      const selected = await this.getFeaturePromise;
      this.selectedFeature = selected;

    } else {
      this.selectedFeature = undefined;

    }
    if (this.ngwMap) {
      this.ngwMap.mapAdapter.map.invalidateSize();
    }
    this._updateQuery();
  }

  private _updateQuery() {
    const query: any = {};
    if (this.selectedFeature) {
      query.feature = this.selectedFeature.id;
    }
    if (this.activeTab) {
      query.tab = this.activeTab;
    }
    this.$router.push({ query });
  }
}
