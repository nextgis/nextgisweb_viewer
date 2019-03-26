import { Vue, Component, Watch } from 'vue-property-decorator';

import { VueConstructor } from 'vue';


export interface Item {
  id: string;
  name: string;
  page?: 'example' | 'readme' | 'api';
  description?: string;
  html?: string;
  md?: string;
  children?: Item[];
  model?: boolean;
  component?: any;
  icon?: string;
  priority?: number;
  _parent?: Item;
}

@Component
export class MainPage extends Vue {

  active: string[] = [];

  open: string[] = [];

  drawer = null;

  items: Item[] = [];


  onOpen(data: string[]) {
    this.open = data;
  }

}
