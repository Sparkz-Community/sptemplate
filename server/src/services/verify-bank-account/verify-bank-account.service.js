// Initializes the `verify-bank-account` service on path `/verify-bank-account`
const { VerifyBankAccount } = require('./verify-bank-account.class');
const hooks = require('./verify-bank-account.hooks');
const TallyBank = require('@iy4u/tallybank-node');

module.exports = function (app) {
  const {secretKey, name, host, port, algorithm,storage} = app.get('tallyBank');
  const tallyBank = new TallyBank(secretKey, {name, host, port, algorithm,storage});
  const options = {
    paginate: app.get('paginate'),
    tallyBank,
  };

  // Initialize our service with any options it requires
  app.use('/verify-bank-account', new VerifyBankAccount(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('verify-bank-account');

  service.hooks(hooks);
};
