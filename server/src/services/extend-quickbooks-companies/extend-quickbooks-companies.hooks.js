const {setField} = require('feathers-authentication-hooks');
const {hooks: {relate, joinHooks: {fJoinHook}}} = require('@iy4u/common-server-lib');


const relateAccountsConfig = {
  herePath: 'accounts',
  therePath: 'quickbooks.connections',
  thereService: 'accounts',
  passParams: true,
};

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment,
      relate('mtm', relateAccountsConfig),
    ],
    update: [
      setEnvironment,
      relate('mtm', relateAccountsConfig),
    ],
    patch: [
      setEnvironment,
      relate('mtm', relateAccountsConfig),
    ],
    remove: [
      relate('mtm', relateAccountsConfig),
    ],
  },

  after: {
    all: [
      fJoinHook('accounts', 'accounts'),
    ],
    find: [],
    get: [],
    create: [
      relate('mtm', relateAccountsConfig),
    ],
    update: [
      relate('mtm', relateAccountsConfig),
    ],
    patch: [
      relate('mtm', relateAccountsConfig),
    ],
    remove: [
      relate('mtm', relateAccountsConfig),
    ],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
