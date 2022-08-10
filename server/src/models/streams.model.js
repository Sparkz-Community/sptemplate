// streams-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'streams';

  const schema = new Schema({
    title: {type: String, required: false},
    description: {type: String, required: false},
    blocked: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
    started: {type: Date},
    ended: {type: Date},
    streamGroup: {type: Schema.Types.ObjectId, ref: 'stream-groups', required: true},
    viewers: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
    live: {type: Boolean, default: false},
    tags: [{type: String}],
    streamId: {type: String},
    streamStatus: {type: String},
    streamData: [
      {
        playbackId: {type: String, index: true, unique: true},
        policy: {type: String},
      },
    ],
    host: {type: Schema.Types.ObjectId, ref: 'accounts', required: true},

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
