const {setField} = require('feathers-authentication-hooks');
const {fastJoin} = require('feathers-hooks-common');

const {utils: {coreCall}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget, lset, lcloneDeep}}} = require('@iy4u/common-utils');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const paymentsResolvers = {
  joins: {
    paymentDetails: {
      // eslint-disable-next-line no-unused-vars
      resolver: ($select, customParams = {}) => async (payment, context) => {
        // let paymentDetails = lget(payment, 'paymentDetails', []);
        // if (paymentDetails.length) {
        //   let params = {
        //     query: {
        //       $client: {
        //         ...customParams,
        //       },
        //       _id: {
        //         $in: paymentDetails,
        //       },
        //     },
        //   };
        //   if ($select) {
        //     lset(params, 'query.$select', $select);
        //   }
        //   let storeId = '';
        //   const store = await coreCall(context, 'stores').get(storeId, {
        //     ...params,
        //     paginate: false,
        //   })
        //     .catch(err => {
        //       console.error('error joining rooms to participant: ' + err.message);
        //     });
        //   lset(payment, '_fastjoin.paymentDetails', rooms);
        // }
        lset(payment, '_fastjoin.paymentDetails', lcloneDeep(payment.paymentDetails));
        return payment._fastjoin.paymentDetails;
      },
      joins: {
        store: ($select, customParams = {}) => async (paymentDetail, context) => {
          let storeId = lget(paymentDetail, 'store');
          if (storeId) {
            let params = {
              query: {
                $client: {
                  ...customParams,
                },
              },
            };
            if ($select) {
              lset(params, 'query.$select', $select);
            }
            const store = await coreCall(context, 'stores').get(storeId, {
              ...params,
            })
              .catch(err => {
                console.error('error joining store to paymentDetails: ' + err.message);
              });
            lset(paymentDetail, '_fastjoin.store', store);
          }
        },
        account: ($select, customParams = {}) => async (paymentDetail, context) => {
          let accountId = lget(paymentDetail, 'account');
          if (accountId) {
            let params = {
              query: {
                $client: {
                  ...customParams,
                },
              },
            };
            if ($select) {
              lset(params, 'query.$select', $select);
            }
            const account = await coreCall(context, 'accounts').get(accountId, {
              ...params,
            })
              .catch(err => {
                console.error('error joining store to paymentDetails: ' + err.message);
              });
            lset(paymentDetail, '_fastjoin.account', account);
          }
        },
        card: ($select, customParams = {}) => async (paymentDetail, context) => {
          let cardId = lget(paymentDetail, 'card');
          if (cardId) {
            let params = {
              query: {
                $client: {
                  ...customParams,
                },
              },
            };
            if ($select) {
              lset(params, 'query.$select', $select);
            }
            const card = await coreCall(context, 'cards').get(cardId, {
              ...params,
            })
              .catch(err => {
                console.error('error joining store to paymentDetails: ' + err.message);
              });
            lset(paymentDetail, '_fastjoin.card', card);
          }
        },
      },
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
    remove: [],
  },

  after: {
    all: [
      fastJoin(
        paymentsResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'paymentsResolversQuery'])) {
            Object.keys(paymentsResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'paymentsResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        },
      ),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
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
