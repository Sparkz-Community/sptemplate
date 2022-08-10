// Initializes the `warehouses` service on path `/warehouses`
const { GlPeriods } = require('./gl-periods.class');
const createModel = require('../../models/gl-periods.model');
const hooks = require('./gl-periods.hooks');

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
  app.use('/gl-periods', new GlPeriods(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('gl-periods');

  service.hooks(hooks);
};
