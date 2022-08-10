const {packages: {lodash: {lset, lpick}}} = require('@iy4u/common-utils');
const {utils: {coreCall}} = require('@iy4u/common-server-lib');


const setUpAccount = context => {
  let data = lpick(context.result, [
    'name',
    'email',
    'phones',
    'addresses',
    'avatar',
    'banner',
    'images',
    'settings',
    'roles',
  ]);

  lset(data, 'logins.ownedBy', [context.result._id]);
  coreCall(context, 'accounts').create(data);
};

module.exports = {
  before: {
    all: [
      context => {
        context.service.options.whitelist = ['$options', '$regex'];
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      setUpAccount,
    ],
    update: [],
    patch: [
    ],
    remove: [],
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
