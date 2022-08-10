// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
// const Common = require('./common/common.schemas');

module.exports = function (app) {
  const mongooseClient = app.get('mongoose');
  const {Schema} = mongooseClient;

  return {
    devices: [{type: Schema.Types.ObjectId, ref: 'devices'}],

    // wpb
    projects: [{ type: Schema.Types.ObjectId, ref: 'wpb-projects', required: false }],
    preferences: {
      type: Object,
      contains: {
        autoSave: {
          type: Object,
          contains: {
            value: {type: Boolean, required: false, default: true},
            debounce: {type: Number, required: false, default: 15000}
          }
        }
      }
    }
  };

};

