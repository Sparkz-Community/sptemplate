// Initializes the `amazon-ps-api` service on path `/amazon-ps-api`
const {AmazonPsApi} = require('./amazon-ps-api.class');
const hooks = require('./amazon-ps-api.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/amazon-ps-api', new AmazonPsApi(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('amazon-ps-api');

  service.hooks(hooks);
};
