// forms-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const modelName = 'forms';

  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;

  const schema = new Schema({
    title: { type: String, required: true },
    fields: [{ type: Object }],
    referLink: { type: Schema.Types.ObjectId, ref: 'refer-links' },
    responses: [{ type: Object }],

    ...Common.commonFieldsFn(app).obj,
  }, {
    timestamps: true
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);

};
