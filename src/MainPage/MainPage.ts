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


  @Watch('$route')
  onPathChange() {
    this._setActive();
  }

  get current() {
    if (!this.active.length) { return undefined; }
    const id = this.active[0];
    const item = this.findItem(id);
    this._setPath(item.id);

    return item;
  }

  mounted() {
    const prepareItem = (conf: Item, _parent?: Item) => {
      const item: Item = {...conf};
      if (conf.children) {
        item.model = true;
        item.children = conf.children.map((i) => prepareItem(i, item));

        const apiModule = this.$store.getters['api/getApiModule'](item.name);
        if (apiModule) {
          const apiItem: Item = {
            name: 'API',
            id: item.id + '-api',
            page: 'api',
            // component: ApiComponent,
            icon: 'mdi-power-plug',
          };
          const readmeIndex = item.children.findIndex((x) => x.page === 'readme');
          if (readmeIndex !== -1) {
            item.children.splice(readmeIndex + 1, 0, apiItem);
          } else {
            item.children.unshift(apiItem);
          }
        }
      } else {
        item._parent = _parent;
      }
      return item;
    };
    const config = process.env.EXAMPLES;
    // @ts-ignore
    this.items = config = config.map((x) => {
      return prepareItem(x);
    });

    this._setActive();
  }

  onOpen(data: string[]) {
    this.open = data;
  }

  findItem(id: string, _items = this.items): Item | undefined {
    for (let fry = 0; fry < _items.length; fry++) {
      const x = _items[fry];
      if (x.id === id) {
        if (x.children) {
          const readme = x.children.find((y) => y.page === 'readme');
          if (readme) {
            return readme;
          }
        }
        return x;
      }
      if (x.children) {
        const find = this.findItem(id, x.children);
        if (find) {
          return find;
        }
      }
    }
  }

  _setActive() {
    const id = this.$route.params && this.$route.params.id;
    const treeItem = id && this.findItem(id);
    if (treeItem) {
      const parents = [];
      let parent = treeItem._parent;
      while (parent) {
        parents.push(parent.id);
        parent = parent._parent;
      }
      this.open = this.open.concat(parents);
      this.active = [treeItem.id];
    } else {
      const getFirstPageItem = (items: Item[]) => {
        return items.find((i) => {
          const pageContent = i.html || i.md;
          if (pageContent) {
            return pageContent;
          } else if (i.children) {
            return getFirstPageItem(i.children);
          }
        });
      };
      const item = getFirstPageItem(this.items);
      const slug = item ? item.id : '';
      this._setPath(slug);
    }
  }

  _setPath(id?: string) {
    const paramsId = this.$router.currentRoute.params.id;
    if (paramsId !== id) {
      let path = this.$router.currentRoute.fullPath;
      path = path.replace(this.$router.currentRoute.hash, '');
      if (this.$router.currentRoute.params && this.$router.currentRoute.params.id) {
        path = path.replace(this.$router.currentRoute.params.id, '');
      }
      this.$router.push(path + id);
    }
  }

}
