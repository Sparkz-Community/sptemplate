const {iff, fastJoin} = require('feathers-hooks-common');

const {packages: {lodash: {lget, lset, lfind}, omitDeep}} = require('@iy4u/common-utils');

const {setField} = require('feathers-authentication-hooks');
const {utils: {coreCall}} = require('@iy4u/common-server-lib');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});


const sharedResolvers = {
  joins: {
    // eslint-disable-next-line no-unused-vars
    setShared: $select => async (board, context) => {
      let shared = lget(board, 'shared', []);
      let user_ids = shared.map(item => item.user);
      if (user_ids.length > 0) {
        let users_res = await coreCall(context, 'users').find({
          query: {
            _id: user_ids,
          },
        });
        let users = users_res.data;

        lset(board, '_fastjoin.shared', shared.map(item => {
          let user = lfind(users, {_id: item.user});
          return {
            ...item,
            user: user,
          };
        }));
      }
    },
  },
};

const createFromTemplate = async context => {
  if (context.params.$boardFromTemplate) {
    omitDeep(context.data, ['_id', '__v', 'createdBy', 'updatedBy', 'updatedAt', 'createdAt']);
    context.params.lists = context.data.lists;
    delete context.data.lists;
  }
};

const createLists = async context => {
  await Promise.all(lget(context, 'params.lists', []).map(card => {
    card.board = context.result._id;
    coreCall(context, 'lists').create(card);
  }));
};

const deleteCards = async context => {
  let boardId = context.id;
  let board = await coreCall(context,'boards').get(boardId);
  await Promise.all(lget(board, 'lists', []).map(cardId => {
    coreCall(context, 'lists').remove(cardId);
  }));

};

const boardResolvers = {
  joins: {
    lists: ($select, customParams = {}) => async (board, context) => {
      let boardLists = lget(board, 'lists', []);
      if (boardLists.length) {
        let params = {
          query: {
            $client: {
              ...customParams,
            },
            _id: {
              $in: boardLists,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const lists = await coreCall(context, 'lists').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining lists to board: ' + err.message);
          });
        lset(board, '_fastjoin.lists', lists);
      }
    },

    shared: ($select, customParams = {}) => async (board, context) => {
      let boardShared = lget(board, 'shared', []).map(i => i.user);
      if (boardShared.length) {
        let params = {
          query: {
            $client: {
              ...customParams,
            },
            _id: {
              $in: boardShared,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const users = await coreCall(context, 'users').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining shared users to board: ' + err.message);
          });
        lset(board, '_fastjoin.shared', users);
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
      createFromTemplate,
    ],
    update: [
      setEnvironment,
    ],
    patch: [
      setEnvironment,
    ],
    remove: [
      deleteCards,
    ],
  },

  after: {
    all: [
      iff(
        context => {
          return lget(context, 'params.$fastJoinShared', false);
        },
        fastJoin(sharedResolvers),
      ),
      fastJoin(
        boardResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'boardResolversQuery'])) {
            Object.keys(boardResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'boardResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        },
      ),
    ],
    find: [],
    get: [],
    create: [
      createLists,
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
