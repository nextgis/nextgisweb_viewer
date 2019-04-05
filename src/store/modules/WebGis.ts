
import { ViewerResource } from './ResourceItem';
import NgwConnector, { Credentials } from '@nextgis/ngw-connector';
export interface WebGis {
  url: string;
  auth: Credentials;
  id?: string;
  meta?: any;
  guest?: boolean;
  connector?: NgwConnector;
  resources?: ViewerResource[];
}

export function createWebGisNameFromUrl(url: string): string {
  let name = '';
  const l = document.createElement('a');
  l.href = url;
  if (l.protocol === 'https:') {
    name += 's_';
  }
  name += l.hostname;
  return name;
}

