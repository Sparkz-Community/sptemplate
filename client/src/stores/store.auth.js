import {Users} from './services/users.js';

import feathersClient from '../api/feathers-client';
import {stores} from '@sparkz-community/auth-management-client-lib';
const {auth} = stores;

export default auth({
  feathersClient,
  Users,
});
