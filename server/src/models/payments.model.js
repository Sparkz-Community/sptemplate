// payments-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'payments';

  const schema = new Schema({
    boardTemplate: {type: Schema.Types.ObjectId, ref: 'board-templates'},
    board: {type: Schema.Types.ObjectId, ref: 'boards'},
    memo: {type: String},
    referenceNumber: {type: String},
    paymentDetails: [
      new Schema({
        account: {type: Schema.Types.ObjectId, ref: 'accounts', required: true},
        store: {type: Schema.Types.ObjectId, ref: 'stores'},
        amount: {type: Number, default: 0, required: true},
        card: {type: Schema.Types.ObjectId, ref: 'cards'},
        paidAmount: {type: Number, default: 0, required: true},
        paidDate: {type: Date},
        memo: {type: String},
        // Quickbooks Fields:
        externalRef: {type: String},
        externalRefDate: {type: Date},
      }, {_id: true, timestamps: true})
    ],

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
