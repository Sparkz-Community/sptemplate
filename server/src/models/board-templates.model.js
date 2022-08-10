// board-template-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
'use strict';

const Common = require('./common/common.schemas');
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'board-templates';


  const ListSchema =  new Schema({
    name: {type: String, required: true},
    order: {type: Number, required: true},
    color: {type: Common.Color(app)},
    hidden: {type: Boolean, default: false},
    rules: Schema.Types.Mixed,
    listGroups: [{type: Schema.Types.ObjectId, ref: 'list-groups'}],
    cards: [{
      ...Common.TaskCardsSchema(app).obj,
      list:  Schema.Types.ObjectId,
      children: [{...Common.TaskCardsSchema(app).obj,  children: [Common.TaskCardsSchema(app)]}],
    }],
  });

  const schema = new Schema({
    name: {type: String, required: true},
    description: {type: String},
    order: {type: Number, required: true},
    color: {type: Common.Color(app)},
    banner: Common.Images(app),
    category: Common.TaskCategory,
    lists: [ListSchema],
    // host: {type: Schema.Types.ObjectId, ref: 'app-hosts'}, // no corresponding service
    // createdBy: {type: Schema.Types.ObjectId, ref: 'users'}, // represented in commons
    // updatedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    // deleted: {type: Boolean, default: false},  // represented in commons

    // cards: [{type: Schema.Types.ObjectId, ref: 'cards'}],
    boards: [{type: Schema.Types.ObjectId, ref: 'boards'}],
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
