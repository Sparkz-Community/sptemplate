// board-template-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const Common = require('./common/common.schemas');
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'boards';


  const ListSchema =  new Schema({
    name: {type: String,},
    order: {type: Number, },
    color: {type: Common.Color(app)},
    hidden: {type: Boolean, default: false},
    cards: [{type: Schema.Types.ObjectId, ref: 'cards'}],
    rules: Schema.Types.Mixed,
    listGroups: [{type: Schema.Types.ObjectId, ref: 'list-groups'}],
    // ...Common.commonFieldsFn(app).obj,
  });

  const schema = new Schema({
    name: {type: String, required: true},
    order: {type: Number, required: true},
    description: {type: String},
    color: {type: Common.Color(app)},
    banner: Common.Images(app),
    category: Common.TaskCategory,
    rules: Schema.Types.Mixed,
    lists: [ListSchema],
    boardTemplate: {type: Schema.Types.ObjectId, ref: 'board-templates'},
    owner: {type: Schema.Types.ObjectId, ref: 'accounts'},
    viewers: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
    sharedWith: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
    supportedServices: [String],
    visibility: {type: String, enum: ['public', 'private', 'domain', 'environment'], default: 'public'},
    // private: {type: Boolean, required: true, default: true},
    counts: [{type: Schema.Types.ObjectId, ref: 'counts'}], // assumed
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
