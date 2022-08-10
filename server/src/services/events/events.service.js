// Initializes the `ac-events` service on path `/ac-events`
const {Events} = require('./events.class');
const createModel = require('../../models/events.model');
const hooks = require('./events.hooks');

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
  app.use('/events', new Events(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('events');

  service.hooks(hooks);
};
