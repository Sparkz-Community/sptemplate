// Initializes the `transformations` service on path `/transformations`
const { Transformations } = require('./transformations.class');
const createModel = require('../../models/transformations.model');
const hooks = require('./transformations.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/transformations', new Transformations(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('transformations');

  service.hooks(hooks);
};
