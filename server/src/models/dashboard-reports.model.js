// dashboard-reports-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app, {connection} = {}) {
  const modelName = 'dashboard-reports';

  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;

  const schema = new Schema({
    name: { type: String, required: true },
    widgets: [new Schema({
      widget: { type: Object },
      value: { type: Schema.Types.Mixed },
    })],
    dashboards: [{ type: Schema.Types.ObjectId, ref: 'dashboards' }],
    ownership: {
      owners: {
        type: [{
          id: {type: Schema.Types.ObjectId, ref: 'accounts'},
          percent: {type: Number, default: null, min: 0, max: 100},
        }],
        validate: {
          validator: function (val) {
            return val.reduce((acc, curr) => {
              if (typeof curr.percent === 'number') {
                acc += curr.percent;
              }
              return acc;
            }, 0) <= 100;
          },
          message: 'owners can not exceed a total of 100.',
        },
      },
      owns: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
    },
    viewerShip: {
      viewers: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
      viewersOf: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
    },
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
