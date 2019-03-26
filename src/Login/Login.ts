import { Vue, Component, Watch } from 'vue-property-decorator';
import { Getter, Action, State } from 'vuex-class';
import { WebGis } from 'src/store/modules/WebGis';

const namespace: string = 'app';

@Component<Login>({})
export class Login extends Vue {

  @State('webGis', { namespace }) webGis!: WebGis;
  @Action('webGis', { namespace }) setWebGis!: (webGis: WebGis) => any;

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
