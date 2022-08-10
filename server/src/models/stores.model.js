// stores-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'stores';

  const schema = new Schema({
    name: {type: String, required: true},
    product: {type: Schema.Types.ObjectId, ref: 'products', required: true},
    saleReps: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
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
          message: 'owners percentage cannot exceed a total of 100.',
        },
      },
    },
    membership: {
      members: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
    },

    quickbooksConnection: {type: Schema.Types.ObjectId, ref: 'quickbooks-companies'},
    glClass: {
      type: Schema.Types.ObjectId,
      ref: 'gl-classes',
      required() {
        return this.quickbooksConnection;
      },
    },
    glDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'gl-departments',
      required() {
        return this.quickbooksConnection;
      },
    },

    ...Common.commonFieldsFn(app).obj,
  }, {
    timestamps: true,
  });

  schema.index({glDepartment: 1, glClass: 1, quickbooksConnection: 1}, {unique: true});

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
