import { Vue, Component } from 'vue-property-decorator';

import { WebGis } from '../store/modules/WebGis';
import { namespace } from 'vuex-class';

export const { Action, Getter, State } = namespace('app');

@Component<Login>({})
export class Login extends Vue {

  @State webGis!: WebGis;
  @Action setWebGis!: (webGis: WebGis) => any;

  guest = true;

  url: string = '';
  login: string = '';
  password: string = '';

  get isValid() {
    if (!this.url) {
      return false;
    }
    if (!this.guest) {
      if (!this.password || !this.login) {
        return false;
      }
    }
    return true;
  }

  onGoBtnClick() {
    this.setWebGis({
      url: this.url,
      auth: {
        login: this.login,
        password: this.password
      }
    });
  }
}
