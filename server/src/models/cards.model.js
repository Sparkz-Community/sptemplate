// cards-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'cards';

  const extend_schema = {
    owners: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
    children: [
      // Common.TaskCardsSchema(app, {schema_remove_paths:['list']})
      {type: Schema.Types.ObjectId, ref: 'cards'}
    ],
    boards: [
      {
        id: {type: Schema.Types.ObjectId, ref: 'boards', index: false},
        currentList:  Schema.Types.ObjectId,
        // previous: {  // un necessary
        //   board: {type: Schema.Types.ObjectId, ref: 'boards'},
        //   list: {type: Schema.Types.ObjectId, ref: 'lists'},
        //   state: Schema.Types.Mixed,
        //   movedAt: Date,
        // },
        onListAt: { type: Date, default: Date.now},
        listHistory: [
          {
            from: {
              board: {type: Schema.Types.ObjectId, ref: 'boards'},
              list: Schema.Types.ObjectId,
              state: Schema.Types.Mixed // can be used for storing any info about the card before it moved from that state to the next
            },
            to: Schema.Types.ObjectId,
            movedAt: { type: Date, default: Date.now},
            movedBy: {
              account: {type: Schema.Types.ObjectId, ref: 'accounts'},
              user: {type: Schema.Types.ObjectId, ref: 'users'},
              login: {type: Schema.Types.ObjectId, ref: 'logins'},
              fingerprint: {type: Schema.Types.ObjectId, ref: 'fingerprints'},
            },
          }
        ],
        removed: {type: Boolean, default: false},
        removedAt: Date,
        removedBy: {type: Schema.Types.ObjectId, ref: 'accounts'},
      }
    ],
    ...Common.commonFieldsFn(app).obj,
  };

  const schema = Common.TaskCardsSchema(app,{extend_schema, schema_remove_paths:['list','parent']});


  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
