// refer-links-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');
module.exports = function (app, {connection} = {}) {
  const modelName = 'refer-links';
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;

  const schema = new Schema({
    subjectId: { type: Schema.Types.ObjectId, refPath: 'subjectName', required: true },
    subjectName: { type: String, required: true, enum: ['accounts'] },
    usedFor: { type: String, enum: ['form', 'page'] },
    interactionCount: { type: Number, min: 0 },
    routeName: { type: String }, // if usedFor = page
    form: { type: Schema.Types.ObjectId, ref: 'forms' }, // if usedFor = form

    ...Common.commonFieldsFn(app).obj,
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
