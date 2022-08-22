import { boot } from 'quasar/wrappers';
// import createStore from '../stores';
import {toRef} from 'vue';

// eslint-disable-next-line no-undef
const requireModule = require.context(
  // The path where the service modules live
  '../stores/services',
  // Whether to look in subfolders
  false,
  // Only include .js files (prevents duplicate imports`)
  /.js$/,
);
const servicePlugins = requireModule
  .keys()
  .map(modulePath => requireModule(modulePath).default);
import auth from '../stores/store.auth';

export default boot(({ app }) => {
  // app.use(createStore({}));
  servicePlugins.forEach(fn => fn());
  let authStore = auth();
  app.config.globalProperties.$authUser = toRef(authStore, 'authUser');
  app.provide('$authUser', toRef(authStore, 'authUser'));
});


