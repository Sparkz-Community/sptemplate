import { boot } from 'quasar/wrappers';
import spRolesClientLib from '@sparkz-community/roles-client-lib';

export default boot(({ app }) => {
  app.use(spRolesClientLib);
});


