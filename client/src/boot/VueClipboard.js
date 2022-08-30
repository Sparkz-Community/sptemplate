import {boot} from 'quasar/wrappers';
import VueClipboard from 'vue3-clipboard';

export default boot(({app}) => {
  app.use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true,
  });
});
