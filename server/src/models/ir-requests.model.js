// ir-requests-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'ir-requests';

  const schema = new Schema({
    subject: String,
    body: String,
    device: {type: Schema.Types.ObjectId, ref: 'devices'},
    affiliate: {type: Schema.Types.ObjectId, ref: 'peoples'},
    team: {type: Schema.Types.ObjectId, ref: 'ir-teams'},
    phone: Common.Phone(app),
    name: String,
    status: {type: String, enum: ['lead', 'open', 'won', 'lost', 'dnc'], default: 'lead'},
    assigned: {type: Schema.Types.ObjectId, ref: 'users'},
    email: {type: String, trim: true, lowercase: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'ir-comments'}],
    resolution: {type: Schema.Types.ObjectId, refPath: 'resolutionModel'},
    resolutionModel: {
      type: String, required: function () {
        return !!this.resolution;
      },
    },

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
