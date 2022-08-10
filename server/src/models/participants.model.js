// participants-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'participants';

  const schema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'accounts'},
    participantEvents: [{type: Schema.Types.ObjectId, ref: 'participant-events'}],
    rooms: [{type: Schema.Types.ObjectId, ref: 'rooms'}],
    unseenChats: [{type: Schema.Types.ObjectId, ref: 'chats'}],

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
