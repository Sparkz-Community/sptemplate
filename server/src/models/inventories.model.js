// inventories-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const Common = require('./common/common.schemas');
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'inventories';

  var skuValidators = [
    {
      validator: function (v) {
        if (this.skus.contains.standard === 'Custom') { //TODO: this is SUDO code just
          return v;
        }
      },
      message: props => `${props.value} blah blah blah - custom sku!`,
    },
    {
      validator: function (v) {
        if (this.skus.contains.standard === 'GS1 QR Code') { //TODO: this is SUDO code just
          return v;
        }
      },
      message: props => `${props.value} blah blah blah - GS1 QR Code found!`,
    },
  ];

  const schema = new Schema({
    name: {type: String, required: true},
    warehouse: {type: Schema.Types.ObjectId, ref: 'warehouses', required: true},
    counts: [{type: Schema.Types.ObjectId, ref: 'counts'}],
    inventoryItems: [{type: Schema.Types.ObjectId, ref: 'inventory-items', required: false}],
    skus: {
      type: Array,
      default: [],
      contains: {
        standard: {type: String, enum: ['GS1 QR Code', 'GS1-128', 'ITF-14', 'GS1 Omnidirectional', 'GS1 Expanded', 'GS1 Stacked Omnidirectional', 'GS1 Expanded Stacked', 'GS1 Truncated', 'GS1 Limited', 'GS1 Stacked', 'EAN-2', 'EAN-E', 'EAN-5', 'EAN-8', 'EAN-13', 'UPC-A', 'Custom']},
        version: {type: String},
        value: {type: Schema.Types.Mixed},
        validate: skuValidators,
      },
    },
    ...Common.commonFieldsFn(app).obj,
  }, {
    timestamps: true,
    discriminatorKey: '_type',
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);

};
