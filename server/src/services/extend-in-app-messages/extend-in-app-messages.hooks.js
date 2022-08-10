const {setField} = require('feathers-authentication-hooks');
const {lget, lset, lmerge} = require('@iy4u/common-utils/lib/packages/lodash');
const {fastJoin} = require('feathers-hooks-common');
const {coreCall} = require('@iy4u/common-server-lib/lib/utils');
const {relate} = require('@iy4u/common-server-lib/lib/hooks/relate-utils');
const {coreAuthentication, joinHooks: {fJoinHook}} = require('@iy4u/common-server-lib').hooks;
const {hooks: {checkContext}} = require('@iy4u/common-server-lib');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateFro = {
  herePath: 'from',
  thereService: 'accounts',
  therePath: 'outbox',
};

const relateTo = {
  herePath: 'to',
  thereService: 'accounts',
  therePath: 'inbox',
};

const processMessage = async context => {

  try {
    if (lget(context.data, 'isExternal')) {
      const to = lget(context.data, 'to').map(account => account.email).join(',');
      const from = lget(context.data, ['from', 'email']);
      const externalData = lmerge(Object.assign({}, context.data), {to, from});
      delete externalData.isExternal;
      delete externalData.status;
      const externalMail = await context.app.service('mailer').create(externalData);
      console.log(externalMail);
    }

    const mongoose = context.app.get('mongoose');
    const {ObjectId} = mongoose.Schema;
    const isString = str => (typeof str === 'string' || str instanceof String);
    if (Array.isArray(lget(context.data, 'to'))) {
      if (lget(context.data, 'to', []).length > 1) {
        lset(context.data, 'to', lget(context.data, 'to').map(account => {
          const id = account._id;
          if (isString(id)) {
            return ObjectId._cast(id);
          }
          return id;
        }));
        lset(context.params, ['query', '_type'], 'bulk');
        lset(context.data, '_type', 'bulk');
      } else {
        lset(context.data, 'to', lget(context.data, ['to', '0', '_id']));
      }
    } else {
      const id = lget(context.data, ['to', '_id']);
      if (isString(id)) {
        lset(context.data, 'to', ObjectId._cast(id));
      } else {
        lset(context.data, 'to', id);
      }

    }
    lset(context.data, 'from', lget(context.data, ['from', '_id']));

    return context;
  } catch (err) {
    throw new Error(err);
  }

};

const handleReply = async (context) => {
  try {
    if (lget(context.data, 'isReply')) {
      if (lget(context.data, 'isExternal')) {
        // TODO:  send external reply
      }
      lset(context, 'data', {
        $addToSet: {
          replies: {
            from: lget(context.data, ['from', '_id']),
            body: lget(context.data, 'body'),
            attachments: lget(context.data, 'attachments', []),
          },
        },
      });
    }
    return context;
  } catch (err) {
    console.log(err);
  }
};

function modifyReply(reply) {
  return async (ctx) => {
    try {
      const {_id, avatar, email, name} = await coreCall(ctx, 'accounts').get(lget(reply, 'from'));
      lset(reply, 'from', {_id, avatar, email, name});
      return reply;
    } catch (err) {
      throw new Error(err);
    }
  };
}

// const replyResolvers = {
//   joins: {
//     replies: () => async (message, ctx) => {
//       if (lget(message, 'replies', []).length > 0) {
//         const modifyReplyArray = lget(message, 'replies', []).map(reply => modifyReply(reply)(ctx));
//         const repliesResult = await Promise.all(modifyReplyArray);
//         lset(message, 'replies', repliesResult);
//       }
//
//     },
//
//   },
// };

const replyResolvers = {
  joins: {
    replies: ($select = ['_id', 'name', 'email', 'avatar'], customParams = {}) => async (message, ctx) => {
      if (lget(message, 'replies', []).length > 0) {
        lset(ctx, ['params','query'], {
          $select,
          $client: {
            ...customParams,
          },
        });
        const modifyReplyArray = lget(message, 'replies', []).map(reply => modifyReply(reply)(ctx));
        try{
          const repliesResult = await Promise.all(modifyReplyArray);
          lset(message, ['_fastjoin','replies'], repliesResult);
        } catch(err){
          throw new Error(err);
        }
      }
    },
  },
};

const updateUnseenMessages = async (context) => {
  checkContext(context, ['after'], ['create']);

  for (const recipient of context.result.to) {
    await coreCall(context, 'accounts').patch(recipient, {
      $addToSet: {
        unseenMessages: context.result._id,
      }
    }).catch(err => {
      console.log('extend-in-app-messages.hooks.js -> updateUnseenMessages: ', err);
    });
  }
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
        // context.service.options.whitelist = ['$options', '$regex'];
        if (!lget(context.data, 'from')) {
          setField(
            {
              from: 'params.user._fastjoin.logins.active._fastjoin.accounts.owns.active',
              as: 'data.from',
            },
          )(context);
        }
      },
    ],
    find: [],
    get: [],
    create: [
      setEnvironment,
      relate('mtm', relateTo),
      relate('otm', relateFro),
      processMessage,
    ],
    update: [
      setEnvironment,
      relate('mtm', relateTo),
      relate('otm', relateFro),
    ],
    patch: [
      setEnvironment,
      relate('mtm', relateTo),
      relate('otm', relateFro),
      handleReply,
    ],
    remove: [
      relate('mtm', relateTo),
      relate('otm', relateFro),
    ],
  },

  after: {
    all: [
      fJoinHook('to', 'accounts'),
      fJoinHook('from', 'accounts'),
      fastJoin(replyResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'replyResolversQuery'])) {
            Object.keys(replyResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'replyResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        }),

    ],
    find: [],
    get: [],
    create: [
      updateUnseenMessages,
      relate('mtm', relateTo),
      relate('otm', relateFro),
    ],
    update: [
      relate('mtm', relateTo),
      relate('otm', relateFro),
    ],
    patch: [
      relate('mtm', relateTo),
      relate('otm', relateFro),
    ],
    remove: [
      relate('mtm', relateTo),
      relate('otm', relateFro),
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
