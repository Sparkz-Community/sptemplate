// Initializes the `ac-stream-groups` service on path `/ac-stream-groups`
const {StreamGroups} = require('./stream-groups.class');
const createModel = require('../../models/stream-groups.model');
const hooks = require('./stream-groups.hooks');

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
  app.use('/stream-groups', new StreamGroups(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('stream-groups');

  service.hooks(hooks);
};
