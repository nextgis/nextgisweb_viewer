import NgwConnector, { Credentials, ResourceItem } from '@nextgis/ngw-connector';
export interface WebGis {
  url: string;
  auth: Credentials;
  connector?: NgwConnector;
  resources?: ResourceItem[];
}
