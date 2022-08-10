// dashboards-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app, {connection} = {}) {
  const modelName = 'dashboards';

  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;

  const schema = new Schema({
    name: { type: String, required: true },
    reports: [{ type: Schema.Types.ObjectId, ref: 'dashboard-reports' }],
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
