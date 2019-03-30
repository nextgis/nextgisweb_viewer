import { Vue, Component, Watch } from 'vue-property-decorator';

import { State } from 'vuex-class';

import { WebGis } from 'src/store/modules/WebGis';

const namespace: string = 'app';

export interface Item {
  id: string;
  name: string;
}

@Component
export class MainPage extends Vue {
  @State('webGis', { namespace }) webGis?: WebGis;
  active: string[] = [];

  open: string[] = [];

  drawer = null;

  get items(): Item[] {
    if (this.webGis) {
      const resources = this.webGis.resources;
      if (resources) {
        return resources.map((x) => {
          const resource = x.resource;
          return {
            id: String(resource.id),
            name: String(resource.display_name)
          };
        });
      }
    }
    return [];
  }

  onOpen(data: string[]) {
    this.open = data;
  }

}
