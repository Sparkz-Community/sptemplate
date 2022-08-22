import { boot } from 'quasar/wrappers';
import spAuthManagementClientLib from '@sparkz-community/auth-management-client-lib';

export default boot(({ app }) => {
  app.use(spAuthManagementClientLib, {loadFormGen: false});
});


