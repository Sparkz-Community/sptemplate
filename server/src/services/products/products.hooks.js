const {setField} = require('feathers-authentication-hooks');
// const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {relate, joinHooks: {fJoinHook}} = require('@iy4u/common-server-lib').hooks;

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relatePriceBooksConfig = {
  herePath: 'priceBooks',
  therePath: 'products.product',
  thereService: 'price-books',
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [setEnvironment, relate('mtm',relatePriceBooksConfig)],
    update: [setEnvironment,  relate('mtm',relatePriceBooksConfig)],
    patch: [setEnvironment,  relate('mtm',relatePriceBooksConfig)],
    remove: [ relate('mtm',relatePriceBooksConfig)]
  },

  after: {
    all: [
      fJoinHook('priceBooks', 'price-books'),
      fJoinHook('inventoryItems', 'inventory-items'),
    ],
    find: [],
    get: [],
    create: [ relate('mtm',relatePriceBooksConfig)],
    update: [ relate('mtm',relatePriceBooksConfig)],
    patch: [ relate('mtm',relatePriceBooksConfig)],
    remove: [ relate('mtm',relatePriceBooksConfig)]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
