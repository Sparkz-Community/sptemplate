// boards-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'boards';

  const schema = new Schema({
    name: {type: String, required: true},
    order: {type: Number, required: true},
    banner: {type: Common.Images(app)},
    shared: [{
      user: {type: Schema.Types.ObjectId, ref: 'users', required: true},
    }],
    requests: {
      inbound: {
        users: {
          // TODO: Validate emails.
          type: Array,
          contains: {
            type: String,
          },
        },
      },
      outbound: {
        users: {
          // TODO: Validate emails.
          type: Array,
          contains: {
            type: String,
          },
        },
      },
    },
    color: {type: Common.Color(app)},
    onServerAt: {type: Date},
    lists: [{type: Schema.Types.ObjectId, ref: 'lists'}],
    counts: [{type: Schema.Types.ObjectId, ref: 'counts'}],
    boardTemplate: {type: Schema.Types.ObjectId, ref: 'board-templates'},
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
