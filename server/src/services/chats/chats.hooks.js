const {fastJoin, iff} = require('feathers-hooks-common');

const {hooks: {relate, checkContext}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget, lset}, omitDeep}} = require('@iy4u/common-utils');
const {setField} = require('feathers-authentication-hooks');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const unseenChats = (context) => {
  checkContext(context, ['after'], ['create']);

  coreCall(context, 'rooms').get(context.result.room, {})
    .then((res) => {
      coreCall(context, 'participants').patch(null,
        {
          $addToSet: {
            unseenChats: context.result._id,
          },
        },
        {
          query: {
            _id: {
              $in: res.participants.filter(p => String(p) !== String(context.result.sender)),
            },
          },
        },
      ).then((res) => {
        console.log(res);
      }).catch((err) => {
        throw new Error(err);
      });
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const relateSenderChatsConfig = {
  paramsName: 'relateSenderChats',
  herePath: 'sender',
  therePath: 'chats',
  thereService: 'participants',
};

const relateRoomChatsConfig = {
  paramsName: 'relateRoomChats',
  herePath: 'room',
  therePath: 'chats',
  thereService: 'rooms',
};

const relateCommentsConfig = {
  paramsName: 'relateComments',
  herePath: 'parent',
  therePath: 'comments',
  thereService: 'chats',
};

const userResolver = {
  joins: {
    users: {
      resolver: () => async (chat, context) => {
        let createdBy = coreCall(context, 'users').find({
          query: {_id: {$in: lget(chat, 'createdBy', [])}},
          paginate: false,
        });

        let updatedBy = coreCall(context, 'users').find({
          query: {_id: {$in: lget(chat, 'updatedBy', [])}},
          paginate: false,
        });

        await Promise.all([createdBy, updatedBy]).then((res) => {
          omitDeep(res, 'password');
          lset(chat, '_fastjoin.createdBy', lget(res, '[0][0]'));
          lset(chat, '_fastjoin.updatedBy', lget(res, '[1][0]'));
        }).catch((err) => {
          return err;
        });

      },
    },
  },
};

const chatResolvers = {
  joins: {
    // eslint-disable-next-line no-unused-vars
    sender: ($select, customParams = {}) => async (chat, context) => {
      if (chat.sender) {
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
        const participant = await coreCall(context, 'participants').get(chat.sender, {
          ...params,
        })
          .catch(err => {
            console.error('error joining participant to chat: ' + err.message);
          });
        lset(chat, '_fastjoin.sender', participant);
      }
    },
    room: ($select, customParams = {}) => async (chat, context) => {
      if (chat.room) {
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
        const room = await coreCall(context, 'rooms').get(chat.room, {
          ...params,
        })
          .catch(err => {
            console.error('error joining room to chat: ' + err.message);
          });
        lset(chat, '_fastjoin.room', room);
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
      relate('otm', relateSenderChatsConfig),
      relate('otm', relateRoomChatsConfig),
      relate('otm', relateCommentsConfig),
    ],
    update: [
      setEnvironment,
      relate('otm', relateSenderChatsConfig),
      relate('otm', relateRoomChatsConfig),
      relate('otm', relateCommentsConfig),
    ],
    patch: [
      setEnvironment,
      relate('otm', relateSenderChatsConfig),
      relate('otm', relateRoomChatsConfig),
      relate('otm', relateCommentsConfig),
    ],
    remove: [
      relate('otm', relateSenderChatsConfig),
      relate('otm', relateRoomChatsConfig),
      relate('otm', relateCommentsConfig),
    ],
  },

  after: {
    all: [
      fastJoin(
        chatResolvers,
        context => {
          let query = {};
          if (lget(context, ['params', 'chatResolversQuery'])) {
            Object.keys(chatResolvers.joins).forEach(key => {
              let val = lget(context, ['params', 'chatResolversQuery', key], false);
              if (val) lset(query, key, val);
            });
          }
          return query;
        },
      ),
      iff(ctx => !!ctx.params.userJoin, fastJoin(userResolver)),
    ],
    find: [],
    get: [],
    create: [
      unseenChats,
      relate('otm', relateSenderChatsConfig),
      relate('otm', relateRoomChatsConfig),
      relate('otm', relateCommentsConfig),
      // async context => {
      //   const otherRoomParticipants = await coreCall(context, 'participants').find({
      //     query: {
      //       _id: {
      //         $ne: context.data.sender,
      //       },
      //       rooms: context.data.room,
      //     },
      //     participantResolversQuery: {
      //       owner: [['_id']],
      //     },
      //   });
      //   const sender = await coreCall(context, 'participants').get(context.data.sender, {
      //     participantResolversQuery: {
      //       owner: [['_id', 'name']], // avatar eventually
      //     },
      //   });
      //   const notificationType = await coreCall(context, 'ac-notification-types').find({
      //     query: {
      //       key: 'MESSAGE',
      //     },
      //   });
      //   otherRoomParticipants.data.forEach(p => {
      //     coreCall(context, 'ac-notifications').create({
      //       message: `${sender._fastjoin.owner.name} sent a message: ${context.data.text}`,
      //       notificationType: notificationType.data[0]._id,
      //       user: p._fastjoin.owner._id,
      //       from: sender._fastjoin.owner._id,
      //       // avatar: sender._fastjoin.owner.avatar.raw.file // ?
      //     });
      //   });
      //   return context;
      // },
    ],
    update: [
      relate('otm', relateSenderChatsConfig),
      relate('otm', relateRoomChatsConfig),
      relate('otm', relateCommentsConfig),
    ],
    patch: [
      relate('otm', relateSenderChatsConfig),
      relate('otm', relateRoomChatsConfig),
      relate('otm', relateCommentsConfig),
    ],
    remove: [
      relate('otm', relateSenderChatsConfig),
      relate('otm', relateRoomChatsConfig),
      relate('otm', relateCommentsConfig),
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
