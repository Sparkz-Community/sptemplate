// wpb-elements-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const {ElementSchema, ElementTypes} = require('./common/pages.schema');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'wpb-elements';

  const schema = new Schema({
    ...ElementSchema(app).obj,
  }, {
    timestamps: true,
    discriminatorKey: '_type',
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  const elementModel = mongooseClient.model(modelName, schema);

  let discriminators = Object.keys(ElementTypes(app)).map(key => {
    let lower = key.toLowerCase();
    return elementModel.discriminator(lower, ElementTypes(app)[key]);
  });

  return {
    elementModel,
    discriminators,
  };
};
