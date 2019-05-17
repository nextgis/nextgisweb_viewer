import { Vue, Component } from 'vue-property-decorator';
import { appModule } from '../../store/modules/app';

@Component
export class SearchPage extends Vue {
  get webGis() { return appModule.webGis; }

  mounted() {
    console.log('search page');
  }
}
