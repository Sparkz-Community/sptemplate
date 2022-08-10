// Initializes the `warehouses` service on path `/warehouses`
const { GlClasses } = require('./gl-classes.class');
const createModel = require('../../models/gl-classes.model');
const hooks = require('./gl-classes.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$options','$regex']
  };

  // Initialize our service with any options it requires
  app.use('/gl-classes', new GlClasses(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('gl-classes');

  service.hooks(hooks);
};
