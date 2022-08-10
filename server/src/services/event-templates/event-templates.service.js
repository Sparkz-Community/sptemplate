// Initializes the `ac-events` service on path `/ac-events`
const {EventTemplates} = require('./event-templates.class');
const createModel = require('../../models/event-templates.model');
const hooks = require('./event-templates.hooks');

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
  app.use('/event-templates', new EventTemplates(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('event-templates');

  service.hooks(hooks);
};
