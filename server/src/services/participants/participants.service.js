// Initializes the `participants` service on path `/participants`
const {Participants} = require('./participants.class');
const createModel = require('../../models/participants.model');
const hooks = require('./participants.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    multi: true,
    whitelist: ['$options','$regex']
  };

  // Initialize our service with any options it requires
  app.use('/participants', new Participants(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('participants');

  service.hooks(hooks);
};
