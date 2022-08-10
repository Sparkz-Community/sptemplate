// Initializes the `board-template` service on path `/board-template`
const { Boards } = require('./boards.class');
const createModel = require('../../models/boards.model');
const hooks = require('./boards.hooks');

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
  app.use('/boards', new Boards(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('boards');

  service.hooks(hooks);
};
