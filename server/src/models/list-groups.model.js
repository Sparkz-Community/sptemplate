// list-groups-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'list-groups';
  const schema = new Schema({
    name: {type: String, required: true},
    description: String,
    order: {type: Number, required: true},
    color: {type: Common.Color(app)},
    hidden: {type: Boolean, default: false},
    rules: Schema.Types.Mixed,
    boards: [{
      id: {type: Schema.Types.ObjectId, ref: 'boards', required: true},
      list: [{type: Schema.Types.ObjectId, ref: 'lists', required: true}],
    }],
    boardTemplates: [{
      id: {type: Schema.Types.ObjectId, ref: 'board-templates', required: true},
      list: [{type: Schema.Types.ObjectId, ref: 'lists', required: true}],
    }],
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
