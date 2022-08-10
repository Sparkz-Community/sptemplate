const {setField} = require('feathers-authentication-hooks');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {
  utils: {coreCall},
  hooks: {relate, joinHooks: {fJoinHook}},
} = require('@iy4u/common-server-lib');
const {fastJoin} = require('feathers-hooks-common');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateAdjustedByConfig = {
  herePath: 'adjustedBy',
  therePath: 'countInventoryItems',
  thereService: 'accounts',
};
const relateInventoryItemConfig = {
  herePath: 'inventoryItem',
  therePath: 'countInventoryItems',
  thereService: 'inventory-items',
};

const relateCountConfig = {
  herePath: 'count',
  therePath: 'countInventoryItems',
  thereService: 'counts',
};

const relateCardConfig = {
  herePath: 'card',
  therePath: 'countInventoryItems',
  thereService: 'cards',
};

const relateCountedByConfig = {
  paramsName: 'relateCountedByConfig',
  herePath: 'countedBy',
  therePath: 'countInventoryItems',
  thereService: 'accounts',
  beforeHooks: [
    context => {
      let newFkIds = lget(context, ['params', 'relateMtm', 'relateCountedByConfig', 'newFkIds'], []).map(item => item.id);
      if (newFkIds.length) {
        lset(context, ['params', 'relateMtm', 'relateCountedByConfig', 'newFkIds'], newFkIds);
      }

      let removedFkIds = lget(context, ['params', 'relateMtm', 'relateCountedByConfig', 'removedFkIds'], []).map(item => item.id);
      if (removedFkIds.length) {
        lset(context, ['params', 'relateMtm', 'relateCountedByConfig', 'removedFkIds'], removedFkIds);
      }

      let fkIds = lget(context, ['params', 'removeMtm', 'relateCountedByConfig', 'fkIds'], []).map(item => item.id);
      if (fkIds.length) {
        lset(context, ['params', 'removeMtm', 'relateCountedByConfig', 'fkIds'], fkIds);
      }
    },
  ],
};

const accountsResolvers = {
  joins: {
    countedBy: ($select, customParams = {}) => async (countInventoryItem, context) => {

      let countedBy = lget(countInventoryItem, 'countedBy', []).map(value => value.id);
      let params = {
        query: {
          $client: {
            ...customParams,
          },
          _id: {
            $in: countedBy,
          },
        },
      };

      try {
        if (countedBy.length) {
          if ($select) {
            lset(params, 'query.$select', $select);
          }
          const results = await coreCall(context, 'accounts').find({
            ...params,
            paginate: false,
          });
          const theCountedBy = results.map(
            account => ({
              id: account,
              price: lget(lget(countInventoryItem, 'countedBy', []).find(res => String(res.id) === String(account._id)), 'quantity', 0.00),
            }),
          );
          lset(countInventoryItem, '_fastjoin.countedBy', theCountedBy);
        }
      } catch (e) {
        console.error(e.message);
      }

    },
    adjustedBy: ($select, customParams = {}) => async (countInventoryItem, context) => {

      let adjustedBy = lget(countInventoryItem, 'adjustedBy');
      let params = {
        query: {
          $client: {
            ...customParams,
          },
        },
      };

      try {
        if (adjustedBy) {
          if ($select) {
            lset(params, 'query.$select', $select);
          }
          const result = await coreCall(context, 'accounts').get(adjustedBy, {
            ...params,
            paginate: false,
          });

          lset(countInventoryItem, '_fastjoin.adjustedBy', result);
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
    create: [
      ctx => {
        return ctx;
      },
      setEnvironment,
      relate('mtm', relateCountedByConfig),
      relate('otm', relateAdjustedByConfig),
      relate('otm', relateInventoryItemConfig),
      relate('otm', relateCountConfig),
      relate('otm', relateCardConfig),
    ],
    update: [
      setEnvironment,
      relate('mtm', relateCountedByConfig),
      relate('otm', relateAdjustedByConfig),
      relate('otm', relateInventoryItemConfig),
      relate('otm', relateCountConfig),
      relate('otm', relateCardConfig),
    ],
    patch: [
      setEnvironment,
      relate('mtm', relateCountedByConfig),
      relate('otm', relateAdjustedByConfig),
      relate('otm', relateInventoryItemConfig),
      relate('otm', relateCountConfig),
      relate('otm', relateCardConfig),
    ],
    remove: [
      relate('mtm', relateCountedByConfig),
      relate('otm', relateAdjustedByConfig),
      relate('otm', relateInventoryItemConfig),
      relate('otm', relateCountConfig),
      relate('otm', relateCardConfig),
    ],
  },

  after: {
    all: [
      fastJoin(
        accountsResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'accountsResolversQuery'])) {
            Object.keys(accountsResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'accountsResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        },
      ),
      fJoinHook('inventoryItem', 'inventory-items'),
      fJoinHook('card', 'card'),
    ],
    find: [],
    get: [],
    create: [
      relate('mtm', relateCountedByConfig),
      relate('otm', relateAdjustedByConfig),
      relate('otm', relateInventoryItemConfig),
      relate('otm', relateCountConfig),
      relate('otm', relateCardConfig),
    ],
    update: [
      relate('mtm', relateCountedByConfig),
      relate('otm', relateAdjustedByConfig),
      relate('otm', relateInventoryItemConfig),
      relate('otm', relateCountConfig),
      relate('otm', relateCardConfig),
    ],
    patch: [
      relate('mtm', relateCountedByConfig),
      relate('otm', relateAdjustedByConfig),
      relate('otm', relateInventoryItemConfig),
      relate('otm', relateCountConfig),
      relate('otm', relateCardConfig),
    ],
    remove: [
      relate('mtm', relateCountedByConfig),
      relate('otm', relateAdjustedByConfig),
      relate('otm', relateInventoryItemConfig),
      relate('otm', relateCountConfig),
      relate('otm', relateCardConfig),
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
