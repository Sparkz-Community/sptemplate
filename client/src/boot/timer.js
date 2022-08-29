import { boot } from 'quasar/wrappers';

import timer from '../utils/timer';

export default boot(({ app }) => {
  app.use(timer);
});


