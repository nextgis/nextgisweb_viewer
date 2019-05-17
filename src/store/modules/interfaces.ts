import { WebGis } from './WebGis';
import { ViewerResource } from './ResourceItem';

export interface AppState {
  webGis: WebGis | null;
}

export interface TreeItemChildrenpdateOptions {
  id: number;
  children: ViewerResource[];
}
