// inventory-items-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'inventory-items';
  const schema = new Schema({
    inventory: {type: Schema.Types.ObjectId, ref: 'inventories', required: true},
    product: {type: Schema.Types.ObjectId, ref: 'products', required: true},
    quantity: {type: Number, default: 0},
    _type: {},
    quantityDate: {type: Date},
    counts: [{type: Schema.Types.ObjectId, ref: 'counts', required: false}],
    countInventoryItems: [{type: Schema.Types.ObjectId, ref: 'count-inventory-items', required: false}],

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
