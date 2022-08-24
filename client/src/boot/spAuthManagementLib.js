import { boot } from 'quasar/wrappers';
import spAuthManagementClientLib from '@sparkz-community/auth-management-client-lib';

import useAuthStore from 'stores/store.auth';

export default boot(({ app }) => {
  app.use(spAuthManagementClientLib, {useAuthStore, loadFormGen: false});
});


