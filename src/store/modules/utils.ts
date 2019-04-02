import { ViewerResource } from './ResourceItem';

export function findResource(resources: ViewerResource[], id: number): ViewerResource | undefined {
  for (const resource of resources) {
    if (resource.id === id) {
      return resource;
    } else if (resource.children && resource._children) {
      const exist = findResource(resource._children, id);
      if (exist) {
        return exist;
      }
    }
  }
}
