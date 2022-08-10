// ac-events-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'events';

  const schema = new Schema({
    name: {type: String},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    images: [{type: Common.Images(app)}],
    eventTemplate: {type: Schema.Types.ObjectId, ref: 'event-templates'},
    templateMeta: Object,
    participantEvents: [{type: Schema.Types.ObjectId, ref: 'participant-events'}],
    parent: {type: Schema.Types.ObjectId, ref: 'events'},
    children: [{type: Schema.Types.ObjectId, ref: 'events'}],
    subjectId: {type: Schema.Types.ObjectId, refPath: 'subjectModel'},
    subjectModel: {
      type: String,
      required() {
        return !!this.subject;
      },
      enum: [],
    },

    // rrules: [{type: Common.RRULE(app)}],
    // excludeRrules: [{type: Common.RRULE(app)}],

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
