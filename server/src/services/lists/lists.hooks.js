const {iff, fastJoin} = require('feathers-hooks-common');

const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');

const {setField} = require('feathers-authentication-hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});


// const { populate } = require('feathers-graph-populate');
//
//
// const populates = {
//   cards: {
//     service: 'cards',
//     nameAs: 'cardCards',
//     keyHere: '_id',
//     keyThere: 'card',
//     asArray: true,
//     params: {}
//   }
// };
// const namedQueries = {
//   withCards: {
//     cards: {}
//   }
// };


const cardsResolvers = {
  joins: {
    // eslint-disable-next-line no-unused-vars
    setCards: $select => async (list, context) => {
      let list_id = lget(list, '_id');
      if (list_id) {
        let cards = await coreCall(context, 'cards').find({
          query: {
            list: list_id,
            parent: {$exists: false},
          },
          $fastJoinCardCommentsUser: true,
        });

        lset(list, '_fastjoin.cards', cards.data);
      }
    },
  },
};

const listResolvers = {
  joins: {
    board: ($select, customParams = {}) => async (list, context) => {
      if (list.board) {
        let params = {
          query: {
            $client: {
              ...customParams
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const board = await coreCall(context, 'boards').get(list.board, {
          ...params,
        })
          .catch(err => {
            console.error('error joining board to list: ' + err.message);
          });
        lset(list, '_fastjoin.board', board);
      }
    },

    cards: ($select, customParams = {}) => async (list, context) => {
      let listCards = lget(list, 'cards', []);
      if (listCards.length) {
        let params = {
          query: {
            $client: {
              ...customParams,
            },
            _id: {
              $in: listCards,
            },
          },
        };
        if ($select) {
          lset(params, 'query.$select', $select);
        }
        const cards = await coreCall(context, 'cards').find({
          ...params,
          paginate: false,
        })
          .catch(err => {
            console.error('error joining cards to list: ' + err.message);
          });
        lset(list, '_fastjoin.cards', cards);
      }
    },
  },
};

const relateBoardConfig = {
  thereService: 'boards',
  herePath: 'board',
  therePath: 'lists',
  addParams: {
    disableSoftDelete: true
  },
};


const deleteCards = async context => {
  let item = context.id;
  if (item) {
    let document = await coreCall(context, 'lists').get(item, {disableSoftDelete: true});
    await Promise.all(lget(document, 'cards', []).map(card => {
      coreCall(context, 'cards').remove(card);
    }));
  }
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      setEnvironment,
      relate('otm', relateBoardConfig),
    ],
    update: [
      setEnvironment,
      relate('otm', relateBoardConfig),
    ],
    patch: [
      setEnvironment,
      relate('otm', relateBoardConfig),
    ],
    remove: [
      relate('otm', relateBoardConfig),
      deleteCards,
    ],
  },

  after: {
    all: [
      // populate({ populates, namedQueries }),
      iff(
        context => {
          return lget(context, 'params.$fastJoinCards', false);
        },
        fastJoin(cardsResolvers),
      ),
      fastJoin(
        listResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'listResolversQuery'])) {
            Object.keys(listResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'listResolversQuery', key], false);
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
      relate('otm', relateBoardConfig),
    ],
    update: [
      relate('otm', relateBoardConfig),
    ],
    patch: [
      relate('otm', relateBoardConfig),
    ],
    remove: [
      relate('otm', relateBoardConfig),
    ],
  },

  error: {
    all: [
      context => {
        return context;
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
