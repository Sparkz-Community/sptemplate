import { boot } from 'quasar/wrappers';
import spCommonClientLib from '@sparkz-community/common-client-lib';

import useAccountsStore, {Accounts} from 'stores/services/accounts';

export default boot(({ app }) => {
  app.use(spCommonClientLib, {useAccountsStore, Accounts});
});


