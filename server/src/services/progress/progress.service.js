// Initializes the `progress` service on path `/progress`
const { Progress } = require('./progress.class');
const hooks = require('./progress.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/progress', new Progress(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('progress');

  service.hooks(hooks);
};
