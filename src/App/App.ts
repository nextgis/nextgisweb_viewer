import { Vue, Component } from 'vue-property-decorator';
import { appModule } from '../store/modules/app';

import { WebGis } from 'src/store/modules/WebGis';
const namespace: string = 'app';

@Component<App>({})
export class App extends Vue {

  get webGis() { return appModule.webGis; }

  // @Getter('fullName', { namespace }) fullName: string;

  created() {
    //
  }
}
