// funnel-responses-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'funnel-responses';

  const response = new Schema({
    question: String,
    answer: {type: Schema.Types.Mixed},
  });

  const schema = new Schema({
    device: {type: Schema.Types.ObjectId, ref: 'devices'},
    person: {type: Schema.Types.ObjectId, ref: 'peoples'},
    responses: [response],

    ...Common.commonFieldsFn(app).obj,
  }, {
    timestamps: true,
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://github.com/Automattic/mongoose/issues/1251
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
