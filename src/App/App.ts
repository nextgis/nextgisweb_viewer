import { Vue, Component } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { WebGis } from 'src/store/modules/WebGis';
const namespace: string = 'app';

@Component<App>({})
export class App extends Vue {
  @State('webGis', { namespace }) webGis!: WebGis;

  // @Getter('fullName', { namespace }) fullName: string;

  created() {
    //
  }
}
