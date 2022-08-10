// products-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const Common = require('./common/common.schemas');
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'products';
  const schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    priceBooks: [{type: Schema.Types.ObjectId, ref: 'price-books'}],
    inventoryItems: [{type: Schema.Types.ObjectId, ref: 'inventory-items'}],
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
