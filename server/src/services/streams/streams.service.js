// Initializes the `streams` service on path `/streams`
const {Streams} = require('./streams.class');
const createModel = require('../../models/streams.model');
const hooks = require('./streams.hooks');

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
  app.use('/streams', new Streams(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('streams');

  service.hooks(hooks);
};
