// Initializes the `forms` service on path `/forms`
const { Forms } = require('./forms.class');
const createModel = require('../../models/forms.model');
const hooks = require('./forms.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/forms', new Forms(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('forms');

  service.hooks(hooks);
};
