// Initializes the `wpb-management` service on path `/wpb-management`
const { WpbManagement } = require('./wpb-management.class');
const hooks = require('./wpb-management.hooks');

module.exports = function (app) {
  const options = {
    paginate: false
  };

  // Initialize our service with any options it requires
  app.use('/wpb-management', new WpbManagement(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-management');

  service.hooks(hooks);
};
