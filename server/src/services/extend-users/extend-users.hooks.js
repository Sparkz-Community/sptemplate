const {packages: {lodash: {lget, lset, lpick}}} = require('@iy4u/common-utils');
const {utils: {coreCall}} = require('@iy4u/common-server-lib');
// const {fastJoin} = require('feathers-hooks-common');

// const extendUserResolvers = {
//   joins: {
//     // eslint-disable-next-line no-unused-vars
//     devices: ($select, customParams = {}) => async (user, context) => {
//       if (user.devices && user.devices.length) {
//         let params = {
//           query: {
//             $client: {
//               ...customParams
//             },
//             _id: {
//               $in: user.devices,
//             },
//           },
//         };
//         if ($select) {
//           lset(params, 'query.$select', $select);
//         }
//         const devices = await coreCall(context, 'devices').find({
//           ...params,
//           paginate: false,
//         })
//           .catch(err => {
//             console.error('error joining device to users: ' + err.message);
//           });
//         lset(user, '_fastjoin.devices', devices);
//       }
//     },
//   },
// };

const setUpLogin = context => {
  let data = lpick(context.result, [
    'name',
    'email',
    // 'password',
    'phones',
    'addresses',
    'avatar',
    'banner',
    'images',
    'settings',
    'roles',
    'auth0Id',
    'googleId',
    'facebookId',
    'twitterId',
    'githubId',
    'linkedInId',
    'boxId',
    'verifiers',
    'isVerified',
    'resetToken',
    'verifyChanges',
    'verifyToken',
    'verifyExpires',
    'verifyShortToken',
    'resetShortToken',
    'resetExpires',
    'resetAttempts',
  ]);

  lset(data, 'user', context.result._id);
  if (lget(context, 'params.password')) lset(data, 'password', lget(context, 'params.password'));

  coreCall(context, 'logins').create(data);
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
    all: [
      // fastJoin(
      //   extendUserResolvers,
      //   context => {
      //     let query = {};
      //     if (lget(context, ['params', 'extendUserResolversQuery'])) {
      //       Object.keys(extendUserResolvers.joins).forEach(key => {
      //         let val = lget(context, ['params', 'extendUserResolversQuery', key], false);
      //         if (val) lset(query, key, val);
      //       });
      //     }
      //     return query;
      //   },
      // ),
    ],
    find: [],
    get: [],
    create: [
      setUpLogin,
    ],
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
