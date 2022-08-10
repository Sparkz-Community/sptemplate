const {setField} = require('feathers-authentication-hooks');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {hooks: {relate}} = require('@iy4u/common-server-lib');
const {coreCall} = require('@iy4u/common-server-lib/lib/utils');
const {fastJoin} = require('feathers-hooks-common');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateProductsConfig = {
  paramsName: 'relateProductsConfig',
  herePath: 'products',
  therePath: 'priceBooks',
  thereService: 'products',
  beforeHooks: [
    context => {
      let newFkIds = lget(context, ['params', 'relateMtm', 'relateProductsConfig', 'newFkIds'], []).map(item => item.product);
      if (newFkIds.length) {
        lset(context, ['params', 'relateMtm', 'relateProductsConfig', 'newFkIds'], newFkIds);
      }

      let removedFkIds = lget(context, ['params', 'relateMtm', 'relateProductsConfig', 'removedFkIds'], []).map(item => item.product);
      if (removedFkIds.length) {
        lset(context, ['params', 'relateMtm', 'relateProductsConfig', 'removedFkIds'], removedFkIds);
      }

      let fkIds = lget(context, ['params', 'removeMtm', 'relateProductsConfig', 'fkIds'], []).map(item => item.product);
      if (fkIds.length) {
        lset(context, ['params', 'removeMtm', 'relateProductsConfig', 'fkIds'], fkIds);
      }
    },
  ],
};

const productsResolvers = {
  joins: {
    products: ($select, customParams = {}) => async (priceBook, context) => {

      let products = lget(priceBook, 'products', []).map(value => value.product);
      let params = {
        query: {
          $client: {
            ...customParams,
          },
          _id: {
            $in: products,
          },
        },
      };

      try {
        if (products.length) {
          if ($select) {
            lset(params, 'query.$select', $select);
          }
          const results = await coreCall(context, 'products').find({
            ...params,
            paginate: false,
          });
          const theProducts = results.map(
            product => ({
              product,
              price: lget(lget(priceBook, 'products', []).find(res => String(res.product) === String(product._id)), 'price', 0.00),
            }),
          );
          lset(priceBook, '_fastjoin.products', theProducts);
        }
      } catch (e) {
        console.error(e.message);
      }

    },
  },
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [setEnvironment, relate('mtm', relateProductsConfig)],
    update: [setEnvironment, relate('mtm', relateProductsConfig)],
    patch: [setEnvironment, relate('mtm', relateProductsConfig)],
    remove: [relate('mtm', relateProductsConfig)],
  },

  after: {
    all: [
      fastJoin(
        productsResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'productsResolversQuery'])) {
            Object.keys(productsResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'productsResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        },
      ),
    ],
    find: [],
    get: [],
    create: [relate('mtm', relateProductsConfig)],
    update: [relate('mtm', relateProductsConfig)],
    patch: [relate('mtm', relateProductsConfig)],
    remove: [relate('mtm', relateProductsConfig)],
  },

  error: {
    all: [
      ctx => {
        return ctx;
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
