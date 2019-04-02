import { ResourceItem, Resource } from '@nextgis/ngw-connector';

export interface ViewerResource extends Resource {
  _children?: ViewerResource[];
}

export interface ViewerResourceItem extends ResourceItem {
  resource: ViewerResource;
}
