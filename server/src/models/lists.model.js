// lists-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'lists';

  const schema = new Schema({
    name: {type: String, required: true},
    order: {type: Number, required: true},
    color: {type: Common.Color(app)},
    board: {type: Schema.Types.ObjectId, ref: 'boards', required: true},
    onServerAt: {type: Date},
    cards: [{type: Schema.Types.ObjectId, ref: 'cards'}],
    completeCard: {type: Boolean, default: false},
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
