// wpb-page-publications-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const PageCommon = require('./common/pages.schema');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'wpb-page-publications';

  const ElementSchema = new Schema({
    ...PageCommon.ElementSchema(app).obj,
  }, {
    _id: false,
    discriminatorKey: '_type',
    timestamps: true,
  });

  const SectionSchema = new Schema({
    ...PageCommon.SectionsSchema(app).obj,
    elements: [ElementSchema],
  }, {
    _id: false,
    timestamps: true,
  });

  SectionSchema.add({
    children: [SectionSchema],
  });

  Object.keys(PageCommon.ElementTypes(app)).forEach(key => {
    let lower = key.toLowerCase();
    SectionSchema.path('elements').discriminator(lower, PageCommon.ElementTypes(app)[key]);
  });

  const PagesSchema = new Schema({
    ...PageCommon.PagesSchema(app).obj,
    sections: [SectionSchema],
  }, {
    _id: false,
    timestamps: true,
  });

  const schema = new Schema({
    version: {type: Number, required: true},
    publish_date: {type: Date, required: false, default: new Date()},
    end_date: {type: Date, required: false},
    active: {type: Boolean, required: false, default: true},
    page_id: {type: Schema.Types.ObjectId, required: true, ref: 'content'},
    page: PagesSchema,
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
