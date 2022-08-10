// Initializes the `wpb-mailer-management` service on path `/wpb-mailer-management`
const { WpbMailerManagement } = require('./wpb-mailer-management.class');
const hooks = require('./wpb-mailer-management.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/wpb-mailer-management', new WpbMailerManagement(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('wpb-mailer-management');

  service.hooks(hooks);
};
