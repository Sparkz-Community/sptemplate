// transformations-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'transformations';

  const schema = new Schema({
    category: {type: String, required: true},
    functionCode: {type: String, required: true},
    name: {type: String, required: true},
    returnType: {type: String, required: true},
    args: {
      type: Array,
      required: true,
      contains: {
        type: Schema.Types.Mixed,
      },
    },
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
