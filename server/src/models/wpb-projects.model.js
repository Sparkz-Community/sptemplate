// wpb-projects-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'wpb-projects';

  const schema = new Schema({
    name: {type: String, required: true},
    pages: [{type: Schema.Types.ObjectId, required: false, ref: 'wpb-pages'}],
    styleSheets: [{type: Schema.Types.ObjectId, required: false, ref: 'wpb-stylesheets'}],
    accessibleBy: {type: String, required: false, enum: ['owner', 'public', 'shared'], default: 'owner'},
    sharedAccessIds: [{type: Schema.Types.ObjectId, required: false, ref: 'users'}],
    visibility: {type: String, required: false, enum: ['public', 'private'], default: 'private'},
    ownerId: {type: Schema.Types.ObjectId, refPath: 'modelName', required: true},
    modelName: {type: String, enum: ['users'], required: true},
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
