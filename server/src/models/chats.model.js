// ac-chats-model.js - A mongoose model
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'chats';

  const schema = new Schema({
    text: {type: String},
    images: [{type: Common.Images(app)}],
    videos: [{type: Schema.Types.ObjectId, ref: 'ac-video-uploads'}],
    room: {type: Schema.Types.ObjectId, ref: 'rooms', required: true},
    sender: {type: Schema.Types.ObjectId, ref: 'participants', required: true},
    parent: {type: Schema.Types.ObjectId, ref: 'chats'},
    children: [{type: Schema.Types.ObjectId, ref: 'chats'}],

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
