// participant-events-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'participant-events';

  const schema = new Schema({
    event: {type: Schema.Types.ObjectId, ref: 'events', required: true},
    name: {type: String},
    role: {type: String, default: 'guest', enum: ['host', 'co-host', 'guest']},
    invited: {type: Boolean, required: true},
    acknowledged: {type: Boolean, required: false},
    attended: {type: Boolean, required: false},
    rooms: [{type: Schema.Types.ObjectId, ref: 'rooms'}],

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
