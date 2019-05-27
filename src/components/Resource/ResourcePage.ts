import { Vue, Component, Watch } from 'vue-property-decorator';

import NgwMap, { VectorLayerAdapter } from '@nextgis/ngw-map';
import { CancelablePromise } from '@nextgis/ngw-connector';

import MapAdapter from '@nextgis/leaflet-map-adapter';
import 'leaflet/dist/leaflet.css';

import { ViewerResource } from '../../store/modules/ResourceItem';
import { Route } from 'vue-router';

import { appModule } from '../../store/modules/app';
import { parse } from 'wellknown';

interface FeatureToSelect {
  id: number;
  layer?: number;
  geom?: boolean;
}

const _highlightId = 'highlight-tmp';

const paint = { fillOpacity: 0.5, stroke: true };
const selectedPaint = { fillOpacity: 0.8, stroke: true, radius: 10 };

@Component
export class ResourcePage extends Vue {
  ngwMap?: NgwMap;

  resource?: ViewerResource;

  selectedResourceId: number;

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
        connector: this.webGis.connector
      });
      this.ngwMap.emitter.on('layer:click', (e) => {
        if (this.vectorLayerId && this.ngwMap) {
          const vectorLayer = this.ngwMap.getLayer(this.vectorLayerId) as VectorLayerAdapter;

          if (vectorLayer.getSelected && e.layer.id === vectorLayer.id) {
            const selected = vectorLayer.getSelected();
            const features: FeatureToSelect[] = [];
            selected.forEach((x) => {
              if (x.feature && x.feature.id) {
                features.push({ id: Number(x.feature.id) });
              }
            });
            this._setSelected(features);
          }
        }
      });
      this.ngwMap.emitter.on('ngw:select', (resp) => {
        const features: FeatureToSelect[] = [];
        for (const layer in resp) {
          if (resp.hasOwnProperty(layer)) {
            if (layer !== 'featureCount') {
              const layerFeatures = resp[layer].features;
              const layerId = Number(layer);
              if (features && layerId !== undefined) {
                layerFeatures.forEach((x) => {
                  features.push({
                    id: x.id,
                    layer: layerId,
                    geom: false
                  });
                });
              }
            }
          }
        }
        this._setSelected(features);
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
          paint,
          selectedPaint,
          selectable: true,
        }
      });

      if (layer && 'getSelected' in layer) {
        const vectorLayer = layer as VectorLayerAdapter;
        this.vectorLayerId = this.ngwMap.getLayerId(layer);

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

  private async _setSelected(features: FeatureToSelect[]) {

    if (this.ngwMap && features && features.length) {
      this.ngwMap.removeLayer(_highlightId);

      const feature = features[0];
      const resourceId = feature.layer || (this.resource && this.resource.id);
      const connector = this.webGis && this.webGis.connector;
      if (this.getFeaturePromise) {
        this.getFeaturePromise = undefined;
      }
      if (feature && connector && resourceId) {
        this.selectedResourceId = resourceId;
        const fid: number = feature.id;
        this.getFeaturePromise = undefined;
        this.getFeaturePromise = connector.get('feature_layer.feature.item', null, {
          id: resourceId,
          fid
        });
        const selected = await this.getFeaturePromise;
        this.selectedFeature = selected;

        if (!feature.geom) {
          const geojson = this._wktToGeoJson(selected.geom);
          this.ngwMap.addLayer('GEOJSON', {
            id: _highlightId,
            data: geojson,
            visibility: true,
            paint
          });
        }

      } else {
        this.selectedFeature = undefined;

      }
      if (this.ngwMap) {
        this.ngwMap.mapAdapter.map.invalidateSize();
      }
      this._updateQuery();
    }
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

  private _wktToGeoJson(geom: string) {
    const geojson = parse(geom);
    // let str = geom;
    // str = str.replace(/(\d+.\d+) (\d+.\d+)/g, '[$1, $2]')
    // str = str.replace('MULTIPOLYGON ', '');
    // str = str.substring(0, str.length - 1);
    // str = str.replace(/\(/g, '[');
    // str = str.replace(/\)/g, ']');
    return NgwMap.toWgs84(geojson);
  }

}
