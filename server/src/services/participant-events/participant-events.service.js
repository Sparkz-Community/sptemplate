// Initializes the `participant-events` service on path `/participant-events`
const {ParticipantEvents} = require('./participant-events.class');
const createModel = require('../../models/participant-events.model');
const hooks = require('./participant-events.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/participant-events', new ParticipantEvents(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('participant-events');

  service.hooks(hooks);
};
