import { Vue, Component } from 'vue-property-decorator';

import { State } from 'vuex-class';

import { WebGis } from 'src/store/modules/WebGis';

const namespace: string = 'app';

@Component
export class SearchPage extends Vue {
  @State('webGis', { namespace }) webGis?: WebGis;

  mounted() {
    console.log('search page');
  }
}
