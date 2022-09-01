const {setField} = require('feathers-authentication-hooks');
const {fastJoin} = require('feathers-hooks-common');
// const tasksContextHooks = require('../../hooks/tasksContextHook');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');

const {hooks: {relate,
  joinHooks: {fJoinHook},
}, utils: {coreCall}
} = require('@iy4u/common-server-lib');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const setOwner = setField({
  from: 'params.user._fastjoin.logins.active.accounts.owns.active',
  as: 'data.owner',
});

const relateOwnerConfig = {
  herePath: 'owner',
  therePath: 'boards',
  thereService: 'accounts',
};

const boardListResolvers = {
  joins: {
    lists: ($select, customParams = {}) => async (board, context) => {

      if(lget(board,['lists'])){
        board.lists =  await Promise.all(lget(board,'lists',[]).map(async list => {
          let params = {
            query: {
              $client: {
                ...customParams,
              },
              _id: {$in: lget(list, ['cards'],[])},
              $and: [
                {'boards.id': lget(board,['_id'])},
                {'boards.removed': false},
                {'boards.currentList': lget(list, '_id')}
              ]
            },
          };
          if ($select) {
            lset(params, 'query.$select', $select);
          }
          const result = await coreCall(context, 'cards').find(params);

          lset(list,['_fastjoin','cards'], lget(result,['data'],[]));
          return list;
        }));
        console.log(board);
      } else {
        board.lists = [];
      }
      console.log(board);
    },
  },
};

const createRecycleList = async context => {
  const boardId = lget(context,['result', '_id']);
  const boardColor = lget(context,['result', 'color']);
  const patchObj = {
    $addToSet: {
      lists: {
        _id: boardId,
        name: 'Recycle Bin',
        order: 1,
        color: boardColor,
        cards: [],
        hidden: true
      }
    }
  };
  try {
    await coreCall(context, lget(context,['path'])).patch(boardId,patchObj);
  } catch (e) {
    throw new Error(e);
  }
  return context;
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment,setOwner,
      // tasksContextHooks,
      relate('otm', relateOwnerConfig),
    ],
    update: [
      setEnvironment,setOwner,
      // tasksContextHooks,
      relate('otm', relateOwnerConfig),

    ],
    patch: [
      setEnvironment,setOwner,
      // tasksContextHooks,
      relate('otm', relateOwnerConfig),

    ],
    remove: [
      relate('otm', relateOwnerConfig),
    ],
  },

  after: {
    all: [
      fastJoin(
        boardListResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'boardListResolversQuery'])) {
            Object.keys(boardListResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'boardListResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        },
      ),
      fJoinHook('owner', 'accounts'),
    ],
    find: [],
    get: [],
    create: [
      relate('otm', relateOwnerConfig),
      createRecycleList
    ],
    update: [
      relate('otm', relateOwnerConfig),
    ],
    patch: [
      relate('otm', relateOwnerConfig),
    ],
    remove: [
      relate('otm', relateOwnerConfig),
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
