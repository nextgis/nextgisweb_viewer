import { Vue, Component, Watch } from 'vue-property-decorator';
import { Getter, Action, State } from 'vuex-class';
import * as app from '../store/modules/app';
import { WebGis } from 'src/store/modules/WebGis';
const namespace: string = 'app';

@Component<App>({})
export class App extends Vue {
  @State('webGis', { namespace }) webGis!: WebGis;
  @Action('name', { namespace }) setName: any;
  // @Getter('fullName', { namespace }) fullName: string;


  created() {
    this.setName({ name: 'Counter' });
  }
}
