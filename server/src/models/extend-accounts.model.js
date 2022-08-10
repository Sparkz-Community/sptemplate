// accounts-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
// const Common = require('./common/common.schemas');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  const mongooseClient = app.get('mongoose');
  const {Schema} = mongooseClient;

  return {
    parent: {type: Schema.Types.ObjectId, ref: 'accounts'},
    children: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
    participant: {type: Schema.Types.ObjectId, ref: 'participants', required: true},
    messages: [{
      labels: [{type: String}],
      rules: [{type: Schema.Types.Mixed}], //TODO: develop the ability to create rules that apply labels
    }],
    outbox: [{type: Schema.ObjectId, ref: 'in-app-messages'}],
    inbox: [{type: Schema.ObjectId, ref: 'in-app-messages'}],
    countInventoryItems: [{type: Schema.Types.ObjectId, ref: 'count-inventory-items'}],

    quickbooks: {
      connections: [{type: Schema.Types.ObjectId, ref: 'quickbooks-companies'}],
      defaultConnection: {type: Schema.Types.ObjectId, ref: 'quickbooks-companies'},
    },

    wallets: {
      ids: [{type: Schema.Types.ObjectId, ref: 'wallets'}],
      default: {type: Schema.Types.ObjectId, ref: 'wallets'},
    },
    unseenMessages: [{type: Schema.Types.ObjectId, ref: 'messages'}],
    // unseenChats: [{type: Schema.Types.ObjectId, ref: 'chats'}], // this is in participants
    unseenTasks: [{type: Schema.Types.ObjectId, ref: 'cards'}],
    boardTemplates: [{type: Schema.Types.ObjectId, ref:'board-templates'}],
    boards: [{type: Schema.Types.ObjectId, ref:'boards'}],
    referLinks: [{type: Schema.Types.ObjectId, ref: 'refer-links'}],

  };
};

