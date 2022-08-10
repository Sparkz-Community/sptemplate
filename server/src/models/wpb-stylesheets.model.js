// wpb-stylesheets-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'wpb-stylesheets';

  const schema = new Schema({
    rules: [{type: Schema.Types.ObjectId, ref: 'wpb-css-rules', required: false}],
    name: {type: String, required: true },
    projects: [{ type: Schema.Types.ObjectId, ref: 'wpb-projects'}],
    cssString: {type: String, required: false},
    order: {type: Number, required: true}
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
