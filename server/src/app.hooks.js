// Application hooks that run for every service
const {softDelete, paramsFromClient, iff} = require('feathers-hooks-common');
// const {paramsFromClient} = require('feathers-graph-populate');

const {
  hooks: {
    restQueryUnstringify,
    removeFastjoin,
    aggregateHook,
    setCoreIdsJwtParams,
    setUrlConfigParams,
    setCoreIdsManualParams,
    setCoreParams,
    setCoreContextParams,
    setWhitelistService,
  },
} = require('@iy4u/common-server-lib');


module.exports = {
  before: {
    all: [
      restQueryUnstringify(),
      removeFastjoin(),
      paramsFromClient(
        'disableSoftDelete',
        '$globalAggregate',
        'paginate',
        'verify_methods',
        'customLogo',
        'customBaseUrl',
        'customNextUrl',
        'relate_hook',
        'userJoin',
        'rolesJoin',
        'rulesJoin',
        'withAbilities',
        'loginsResolversQuery',
        'usersResolversQuery',
        'instances_fJoinHookResolversQuery',
        'v-instances_fJoinHookResolversQuery',
        'domains_fJoinHookResolversQuery',
        'hosts_fJoinHookResolversQuery',
        'environments_fJoinHookResolversQuery',
        'applications_fJoinHookResolversQuery',
        'integrations_fJoinHookResolversQuery',
        'integration-auths_fJoinHookResolversQuery',
        'in-app-messages_fJoinHookResolversQuery',
        'accounts_fJoinHookResolversQuery',
        'storesResolversQuery',
        'stores_fJoinHookResolversQuery',
        'counts_fJoinHookResolversQuery',
        'count-inventory-items_fJoinHookResolversQuery',
        'inventories_fJoinHookResolversQuery',
        'board-templates_fJoinHookResolversQuery',
        'inventory-items_fJoinHookResolversQuery',
        'gl-accounts_fJoinHookResolversQuery',
        'accountResolversQuery',
        'products_fJoinHookResolversQuery',
        'productsResolversQuery',
        'quickbooks/companies_fJoinHookResolversQuery',
        'replyResolversQuery',
        'QRedirectUri',
        'QState',
        'roomResolversQuery',
        'listCreatorResolversQuery',
        'participantResolversQuery',
        'paymentsResolversQuery',
        'chatResolversQuery',
        'boardResolversQuery',
        'listResolversQuery',
        'cardResolversQuery',
        'cardEventResolversQuery',
        'eventResolversQuery',
        'participantEventResolversQuery',
        'streamGroupResolversQuery',
        'streamResolversQuery',
        'boardListResolversQuery',
        // 'extendUserResolversQuery',

        // TODO: remove when fastjoins get refactored
        '$fastJoinCards',
        '$fastJoinCardUser',
        '$fastJoinCardCommentsUser',
        '$fastJoinShared',
      ),
      iff(
        context => ![
          'authentication',
          'sms',
          'mailer',
          'authManagement',
          'geocode',
          'places',
          'places-auto-complete',
          'file-uploader',
          'uploads',
          ...Object.values(context.app.get('uploads').enums.UPLOAD_SERVICES),
        ].includes(context.path) && !context.path.includes('quickbooks'),
        softDelete({
          // eslint-disable-next-line no-unused-vars
          deletedQuery: async context => {
            return {deleted: {$ne: true}, deletedAt: null};
          },
          // eslint-disable-next-line no-unused-vars
          removeData: async context => {
            return {deleted: true, deletedAt: new Date()};
          },
        }),
      ),
      setCoreIdsJwtParams(),
      setUrlConfigParams(),
      iff(
        context => !context.path.includes('quickbooks'),
        [
          setCoreIdsManualParams(),
          setCoreParams(),
          setCoreContextParams(),
        ],
      ),
      setWhitelistService({
        whitelist: ['$options', '$regex'],
        services: ['instances', 'v-instances', 'domains', 'applications', 'environments', 'hosts', 'integrations', 'integration-auths','in-app-messages'],
      }),
    ],
    find: [
      aggregateHook(),
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [
      // serviceLogger(),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [
      // serviceLogger(),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
