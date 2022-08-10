const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {fastJoin} = require('feathers-hooks-common');

const relateOtmConfig = {
  herePath: 'card',
  therePath: 'cardEvents',
  thereService: 'cards',
};

const cardUpdate = async context => {
  // console.log('\n\n\n\n result is', context.result);
  if (context.result.card) {
    // console.log('\n\n\n\n proposal id is', context.result.proposal);
    let card = await coreCall(context, 'cards').get(context.result.card);
    // console.log('\n\n\n\n document is: ', document);
    if (card) {
      let card_id = card.card;
      if (card_id) {
        let card = await coreCall(context, 'cards').get(card_id, {$fastJoinCards: true});
        if (card) {
          await context.app.service('cards').emit('updated', card);
        }
      }
    }
  }
};

const cardEventResolvers = {
  joins: {
    card: ($select, customParams = {}) => async (cardEvent, context) => {
      if (cardEvent.card) {
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
        const card = await coreCall(context, 'cards').get(cardEvent.card, {
          ...params,
        })
          .catch(err => {
            console.error('error joining card to cardEvent: ' + err.message);
          });
        lset(cardEvent, '_fastjoin.card', card);
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
      relate('otm', relateOtmConfig),
    ],
    update: [
      relate('otm', relateOtmConfig),
    ],
    patch: [
      relate('otm', relateOtmConfig),
    ],
    remove: [
      relate('otm', relateOtmConfig),
    ],
  },

  after: {
    all: [
      fastJoin(
        cardEventResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'cardEventResolversQuery'])) {
            Object.keys(cardEventResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'cardEventResolversQuery', key], false);
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
      relate('otm', relateOtmConfig),
      cardUpdate,
    ],
    update: [
      relate('otm', relateOtmConfig),
      cardUpdate,
    ],
    patch: [
      relate('otm', relateOtmConfig),
      cardUpdate,
    ],
    remove: [
      relate('otm', relateOtmConfig),
      cardUpdate,
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
