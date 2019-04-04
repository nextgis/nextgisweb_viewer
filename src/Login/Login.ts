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
  formHasErrors = true;
  isLoading = false;
  loginErrorMessage = '';

  form: string[] = ['url', 'login', 'password'];

  rules: { [x: string]: (value: string) => string | boolean } = {
    validUrl: (value) => {
      const isHttp = /^https?/.test(value);
      if (!isHttp) {
        return 'Url should start with http:// or https://';
      }
      return true;
      // const isUrlValid = this.isUrlValid(value);
      // return isUrlValid || 'Url is not valid';
    }
  };

  get isValid() {
    if (!this.url) {
      return false;
    }
    if (!this.guest) {
      if (!this.password || !this.login) {
        return false;
      }
    }
    return this.form.every((f) => {
      const input = this.$refs[f];
      // @ts-ignore
      return input ? input.valid : true;
    });
  }

  onGoBtnClick() {
    if (this.isValid) {
      this.isLoading = true;
      this.loginErrorMessage = '';
      this.setWebGis({
        url: this.url,
        auth: {
          login: this.login,
          password: this.password
        }
      }).then(() => {
        this.isLoading = false;
      }).catch((er: any) => {
        console.log(er);
        this.loginErrorMessage = 'Login error';
        this.isLoading = false;
      });
    }
  }

  private isUrlValid(userInput: string) {
    const res = userInput.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return res !== null;
  }
}
