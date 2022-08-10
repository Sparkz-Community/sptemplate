// pm-transaction-logs-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'pm-transaction-logs';

  const schema = new Schema({
    modelId: {type: Schema.Types.ObjectId, refPath: 'modelName', required: true, index: true},
    modelName: {type: String, required: true, index: true, enum: ['cards']},
    event: {type: String, required: true},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users', required: false},
    before: {type: Schema.Types.Mixed, required: false},
    after: {type: Schema.Types.Mixed, required: false},
    diff: {type: Schema.Types.Mixed, required: true},
    changed: {type: Schema.Types.Mixed, required: true},
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
