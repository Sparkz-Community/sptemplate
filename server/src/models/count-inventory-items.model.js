// count-inventory-items-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'count-inventory-items';
  const schema = new Schema({
    inventoryItem: {type: Schema.Types.ObjectId, ref: 'inventory-items'},
    count: {type: Schema.Types.ObjectId, ref: 'counts'},
    card: {type: Schema.Types.ObjectId, ref: 'cards'},
    inventoryQuantity: {type: Number},
    actualQuantity: {type: Number},
    adjustment: {type: Number},
    countedBy: [{
      id: {type: Schema.Types.ObjectId, ref: 'accounts'},
      quantity: {type: Number},
    }],
    adjustedBy: {type: Schema.Types.ObjectId, ref: 'accounts'},
    adjustedDate: {type: Date},

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
