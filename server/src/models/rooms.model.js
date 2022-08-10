// ac-rooms-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'rooms';

  const schema = new Schema({
    name: {type: String, required: false},
    streamGroups: [{type: Schema.Types.ObjectId, ref: 'stream-groups'}],
    participantEvents: [{type: Schema.Types.ObjectId, ref: 'participant-events'}],
    chats: [{type: Schema.Types.ObjectId, ref: 'chats'}],
    participants: [{type: Schema.Types.ObjectId, ref: 'participants'}],

    directMessage: {type: Boolean},

    ...Common.commonFieldsFn(app).obj,
  }, {
    timestamps: true,
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
