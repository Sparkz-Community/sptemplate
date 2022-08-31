import { boot } from 'quasar/wrappers';
import spCommonClientLib from '@sparkz-community/common-client-lib';

import useAccountsStore, {Accounts} from 'stores/services/accounts';
import {QuickbooksCompanies} from 'stores/services/quickbook-companies';
import useGeocodeStore from 'stores/services/geocode';
import usePlacesAutoCompleteStore from 'stores/services/geocode';

const useStores = {
  useAccountsStore: useAccountsStore,
  useGeocodeStore: useGeocodeStore,
  usePlacesAutoCompleteStore: usePlacesAutoCompleteStore,
};

const serviceModels = {
  Accounts: Accounts,
  QuickbooksCompanies: QuickbooksCompanies,
};

export default boot(({ app }) => {
  app.use(spCommonClientLib, {useStores, serviceModels});
});
