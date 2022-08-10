// Initializes the `counts` service on path `/counts`
const { Counts } = require('./counts.class');
const createModel = require('../../models/counts.model');
const hooks = require('./counts.hooks');

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
  app.use('/counts', new Counts(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('counts');

  service.hooks(hooks);
};
