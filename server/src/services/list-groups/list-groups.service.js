// Initializes the `list-groups` service on path `/list-groups`
const { ListGroups } = require('./list-groups.class');
const createModel = require('../../models/list-groups.model');
const hooks = require('./list-groups.hooks');

const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');


module.exports = function (app) {
  const defaultName = lget(app.get('instances'), 'name', 'default');
  const connection = app.get(`${defaultName}MongooseClient`);

  const options = {
    Model: createModel(app, {connection}),
    paginate: app.get('paginate'),
    whitelist: ['$options','$regex'],
    multi: true,
  };

  // Initialize our service with any options it requires
  app.use('/list-groups', new ListGroups(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('list-groups');

  service.hooks(hooks);
};

