
import { ViewerResource } from './ResourceItem';
import NgwConnector, { Credentials } from '@nextgis/ngw-connector';

interface WebGisMeta {
  systemName?: string;
}
export interface WebGis {
  url: string;
  auth?: Credentials;
  id?: string;
  meta?: WebGisMeta;
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

export function createUrlFromWebGisName(str: string): string {
  return `https://${str}.nextgis.com`;
}

