import { boot } from 'quasar/wrappers';

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
import useAuthStore from 'stores/store.auth';

export default boot((/*{ app }*/) => {
  servicePlugins.forEach(fn => fn());
  useAuthStore();
});


