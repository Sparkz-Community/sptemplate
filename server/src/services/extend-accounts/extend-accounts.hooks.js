const {setField} = require('feathers-authentication-hooks');
const {lset, lget} = require('@iy4u/common-utils/lib/packages/lodash');
const {fastJoin} = require('feathers-hooks-common');
const {coreCall} = require('@iy4u/common-server-lib/lib/utils');
const {relate} = require('@iy4u/common-server-lib/lib/hooks/relate-utils');
const {hooks: {checkContext}} = require('@iy4u/common-server-lib');
const {coreAuthentication, joinHooks: {fJoinHook}} = require('@iy4u/common-server-lib').hooks;

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const accountResolvers = {
  joins: {
    members: ($select, customParams = {}) => async (account, context) => {
      let accountMembers = lget(account, 'membership.members', []);
      if (accountMembers.length) {
        let params = {
          query: {
            $client: {
              ...customParams,
            },
            _id: {
              $in: accountMembers,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const members = await coreCall(context, 'accounts').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining members to accounts: ' + err.message);
          });
        lset(account, '_fastjoin.membership.members', members);
      }
    },

    owners: ($select, customParams = {}) => async (account, context) => {
      let accountOwners = lget(account, 'ownership.owners', []).map(item => item.id);
      if (accountOwners.length) {
        let params = {
          query: {
            $client: {
              ...customParams,
            },
            _id: {
              $in: accountOwners,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const owners = await coreCall(context, 'accounts').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining owners to accounts: ' + err.message);
          });
        lset(account, '_fastjoin.ownership.owners', owners);
      }
    },

    wallets: ($select, customParams = {}) => async (account, context) => {
      let wallets = lget(account, 'wallets.ids', []);
      if (wallets.length) {
        let params = {
          query: {
            $client: {
              ...customParams,
            },
            _id: {
              $in: wallets,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const wallets = await coreCall(context, 'wallets').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining owners to accounts: ' + err.message);
          });
        lset(account, '_fastjoin.wallets', wallets);
      }
    },
  },
};

const createParticipant = async (context) => {
  checkContext(context, ['before', 'after'], 'create');

  if (context.type === 'before') {
    let participant = await coreCall(context, 'participants').create({});
    lset(context, 'data.participant', participant._id);
  } else {
    coreCall(context, 'participants').patch(context.result.participant, {
      owner: context.result._id,
    });
  }
};

const relateMembersToMembersOfConfig = {
  paramsName: 'relateMembersToMembersOfConfig',
  herePath: 'membership.members',
  therePath: 'membership.membersOf',
  thereService: 'accounts',
};

const relateWalletsConfig = {
  herePath: 'wallets.ids',
  thereService: 'wallets',
  therePath: 'account',

};
// const relateOwnersToOwnsConfig = {
//   paramsName: 'relateOwnersToOwnsConfig',
//   herePath: 'ownership.owners',
//   therePath: 'ownership.owns',
//   thereService: 'accounts',
//   beforehooks: []
// };

const relateAccounts = {
  herePath: 'inbox',
  thereService: 'in-app-messages',
  therePath: 'to',
};

const relateQuickbooksConnectionsConfig = {
  herePath: 'quickbooks.connections',
  therePath: 'accounts',
  thereService: 'quickbooks/companies',
  passParams: true,
};



module.exports = {
  before: {
    all: [
      coreAuthentication({
        required: [
          {service: 'authentication', strategies: ['jwt']},
          // {service: 'integrationAuth', strategies: ['jwt']},
        ],
        optional: [
          // {service: 'authentication', strategies: ['jwt']},
          // {service: 'integrationAuth', strategies: ['jwt']},
        ],
      }),
      context => {
        context.service.options.whitelist = ['$options', '$regex'];
      },
    ],
    find: [],
    get: [],
    create: [
      setEnvironment,
      createParticipant,
      relate('mtm', relateMembersToMembersOfConfig),
      relate('mtm', relateAccounts),
      relate('mtm', relateQuickbooksConnectionsConfig),
      relate('otm',relateWalletsConfig)
    ],
    update: [
      setEnvironment,
      relate('mtm', relateMembersToMembersOfConfig),
      relate('mtm', relateAccounts),
      relate('mtm', relateQuickbooksConnectionsConfig),
      relate('otm',relateWalletsConfig)
    ],
    patch: [
      setEnvironment,
      relate('mtm', relateMembersToMembersOfConfig),
      relate('mtm', relateAccounts),
      relate('mtm', relateQuickbooksConnectionsConfig),
      relate('otm',relateWalletsConfig)
    ],
    remove: [
      relate('mtm', relateMembersToMembersOfConfig),
      relate('mtm', relateAccounts),
      relate('mtm', relateQuickbooksConnectionsConfig),
      relate('otm',relateWalletsConfig)
    ],
  },

  after: {
    all: [
      fastJoin(
        accountResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'accountResolversQuery'])) {
            Object.keys(accountResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'accountResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        }
      ),
      fJoinHook('inbox', 'in-app-messages'),
      fJoinHook('outbox', 'in-app-messages'),
      fJoinHook('quickbooksConnection', 'quickbooks/companies'),
    ],
    find: [],
    get: [],
    create: [
      createParticipant,
      relate('mtm', relateMembersToMembersOfConfig),
      relate('mtm', relateAccounts),
      relate('mtm', relateQuickbooksConnectionsConfig),
      relate('otm',relateWalletsConfig)
    ],
    update: [
      relate('mtm', relateMembersToMembersOfConfig),
      relate('mtm', relateAccounts),
      relate('mtm', relateQuickbooksConnectionsConfig),
      relate('otm',relateWalletsConfig)
    ],
    patch: [
      relate('mtm', relateMembersToMembersOfConfig),
      relate('mtm', relateAccounts),
      relate('mtm', relateQuickbooksConnectionsConfig),
      relate('otm',relateWalletsConfig)
    ],
    remove: [
      relate('mtm', relateMembersToMembersOfConfig),
      relate('mtm', relateAccounts),
      relate('mtm', relateQuickbooksConnectionsConfig),
      relate('otm',relateWalletsConfig)
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
