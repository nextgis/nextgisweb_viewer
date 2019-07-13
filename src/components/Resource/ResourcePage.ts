import { Vue, Component, Watch } from 'vue-property-decorator';

import NgwMap, { VectorLayerAdapter } from '@nextgis/ngw-map';
import { CancelablePromise, FeatureItem, FeatureLayersIdentify } from '@nextgis/ngw-connector';

import MapAdapter from '@nextgis/leaflet-map-adapter';
import 'leaflet/dist/leaflet.css';

import { ViewerResource } from '../../store/modules/ResourceItem';
import { Route } from 'vue-router';

import { appModule } from '../../store/modules/app';

import { WebMapLayerAdapter } from 'nextgisweb_frontend/packages/ngw-kit/src';

interface FeatureToSelect {
  id: number;
  // layer?: LayerAdapter;
  layer?: string;
  resourceId?: number;
  geom?: boolean;
}

const _highlightId = 'highlight-tmp';

const paint = { fillOpacity: 0.5, stroke: true };
const selectedPaint = { fillOpacity: 0.8, stroke: true, radius: 10 };

@Component
export class ResourcePage extends Vue {
  ngwMap?: NgwMap;

  resource?: ViewerResource;

  isLoading = true;
  // activeTab: 'fields' | 'attachment' | 'description' = 'fields';
  activeTab = '0';

  selectedResourceId?: number;

  featureToSelectModel!: FeatureToSelect;

  selectedFeatures: FeatureToSelect[] = [];

  selectedFeature: FeatureItem | false = false;

  ngwLayerId: string | undefined = undefined;

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
        if (this.ngwLayerId && this.ngwMap) {
          const vectorLayer = this.ngwMap.getLayer(this.ngwLayerId) as VectorLayerAdapter;

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
        this._onSelect(resp);
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
    this.selectedFeature = false;

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

  getSelectedItemText(feature: FeatureToSelect) {
    return feature.id;
  }

  async showLayer() {
    const resource = this.resource;
    if (resource && this.ngwMap) {
      this.isLoading = true;
      if (resource.cls !== 'basemap_layer') {
        this.ngwMap.removeOverlays();
      }

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
        this.ngwLayerId = this.ngwMap.getLayerId(layer);

        const feature = this.$router.currentRoute.query.feature;
        if (feature && vectorLayer.select) {
          const featureId = Number(feature);
          vectorLayer.select((x) => {
            return !!(x && x.feature && x.feature.id === featureId);
          });
          this._setSelected([{
            id: featureId
          }]);
        }
      }
      if (layer) {
        if (resource.cls === 'basemap_layer') {
          this.ngwMap.showLayer(layer);
        } else {
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
  }

  cleanSelected() {
    const ngwMap = this.ngwMap;
    if (ngwMap && this.ngwLayerId) {
      ngwMap.unSelectLayer(this.ngwLayerId);
    }
    this._setSelected([]);
  }

  onSelectionChange(feature?: FeatureToSelect) {
    if (feature) {
      this._setSelectFeature(feature);
    }
  }

  private async _onSelect(identify: FeatureLayersIdentify) {
    const features: FeatureToSelect[] = [];
    if (this.ngwMap) {
      for (const l in identify) {
        if (identify.hasOwnProperty(l)) {
          if (l !== 'featureCount') {
            const layerFeatures = identify[l].features;
            const resourceId = Number(l);
            const layer = await this.ngwMap.getNgwLayerByResourceId(resourceId) as WebMapLayerAdapter;
            if (features && layer) {
              layerFeatures.forEach((x) => {
                features.push({
                  id: x.id,
                  // @ts-ignore FIXME: need work with adapter options interface
                  layer: layer.layer && layer.options.display_name,
                  resourceId,
                  geom: false
                });
              });
            }
          }
        }
      }
      this._setSelected(features);
    }
  }

  private async _setSelected(features: FeatureToSelect[]) {
    const feature = features[0];
    this.selectedFeatures = features;
    this._setSelectFeature(feature);
  }

  private async _setSelectFeature(feature: FeatureToSelect) {
    if (this.ngwMap) {
      if (this.featureToSelectModel !== feature) {
        this.featureToSelectModel = feature;
      }
      this.ngwMap.removeLayer(_highlightId);

      const resourceId = feature && feature.resourceId || (this.resource && this.resource.id);
      const connector = this.webGis && this.webGis.connector;
      if (this.getFeaturePromise) {
        this.getFeaturePromise.cancel();
      }
      if (feature && connector && resourceId) {
        this.selectedResourceId = resourceId;
        const fid: number = feature.id;
        this.getFeaturePromise = connector.get('feature_layer.feature.item', null, {
          id: resourceId,
          fid,
          srs: 4326,
          geom_format: 'geojson'
        });
        const selected = await this.getFeaturePromise;
        this.selectedFeature = selected;

        if (!feature.geom) {
          const geojson = selected.geom;
          this.ngwMap.addLayer('GEOJSON', {
            id: _highlightId,
            data: geojson,
            visibility: true,
            paint
          });
        }

      } else {
        this.selectedFeature = false;
      }
      if (this.ngwMap) {
        // TODO: test for other map frameworks
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
    // this.$router.push({ query });
  }


}
