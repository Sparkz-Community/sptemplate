const { setField } = require('feathers-authentication-hooks');
const {lget, lset} = require('@iy4u/common-utils/lib/packages/lodash');
const {coreCall} = require('@iy4u/common-server-lib/lib/utils');
const {fastJoin} = require('feathers-hooks-common');
const {joinHooks: {fJoinHook}} = require('@iy4u/common-server-lib').hooks;

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment'
});

const storesResolvers = {
  joins: {
    members: ($select, customParams = {}) => async (store, context) => {
      let storeMembers = lget(store, 'membership.members', []);
      if (storeMembers.length) {
        let params = {
          query: {
            $client: {
              ...customParams,
            },
            _id: {
              $in: storeMembers,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const members = await coreCall(context, 'stores').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining members to accounts: ' + err.message);
          });
        lset(store, '_fastjoin.membership.members', members);
      }
    },

    owners: ($select, customParams = {}) => async (store, context) => {
      let storeOwners = lget(store, 'ownership.owners', []).map(item => item.id);
      if (storeOwners.length) {
        let params = {
          query: {
            $client: {
              ...customParams,
            },
            _id: {
              $in: storeOwners,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const owners = await coreCall(context, 'stores').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining owners to stores: ' + err.message);
          });
        lset(store, '_fastjoin.ownership.owners', owners);
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
      setEnvironment,
    ],
    update: [
      setEnvironment,
    ],
    patch: [
      setEnvironment,
    ],
    remove: []
  },

  after: {
    all: [
      fastJoin(
        storesResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'storesResolversQuery'])) {
            Object.keys(storesResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'storesResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        }
      ),
      fJoinHook('product', 'products'),
      fJoinHook('glClass', 'gl-classes'),
      fJoinHook('glDepartment', 'gl-departments'),
      fJoinHook('quickbooksConnection','quickbooks/companies'),
      fJoinHook('saleReps','accounts')
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
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
