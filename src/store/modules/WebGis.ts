
import { ViewerResource } from './ResourceItem';
import NgwConnector, { Credentials } from '@nextgis/ngw-connector';
export interface WebGis {
  url: string;
  auth: Credentials;
  connector?: NgwConnector;
  resources?: ViewerResource[];
}
