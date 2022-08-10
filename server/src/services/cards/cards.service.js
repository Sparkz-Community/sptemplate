// Initializes the `cards` service on path `/cards`
const { Cards } = require('./cards.class');
const createModel = require('../../models/cards.model');
const hooks = require('./cards.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$options','$regex','$exists'],
    multi: true,
  };

  // Initialize our service with any options it requires
  app.use('/cards', new Cards(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('cards');

  service.hooks(hooks);
};
