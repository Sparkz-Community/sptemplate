// Initializes the `card-events` service on path `/iy-card`
const { CardEvents } = require('./card-events.class');
const createModel = require('../../models/card-events.model');
const hooks = require('./card-events.hooks');

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
  app.use('/card-events', new CardEvents(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('card-events');

  service.hooks(hooks);
};
