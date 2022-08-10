// Initializes the `form-builder` service on path `/form-builder`
const { FormBuilder } = require('./form-builder.class');
const createModel = require('../../models/form-builder.model');
const hooks = require('./form-builder.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/form-builder', new FormBuilder(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('form-builder');

  service.hooks(hooks);
};
