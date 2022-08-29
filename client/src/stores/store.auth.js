import feathersClient from '../api/feathers-client';
import {stores} from '@sparkz-community/auth-management-client-lib';
const {auth} = stores;

import {Users} from './services/users.js';
import {Logins} from './services/logins.js';
import {Accounts} from '@sparkz-community/common-client-lib/src/stores/services/accounts';

export default auth({
  feathersClient,
  Users,
  Logins,
  Accounts,
  state() {
    return {

    };
  },
  getters: {

  },
  actions: {

  },
});
