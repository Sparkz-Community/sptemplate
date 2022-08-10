const Common = require('./common/common.schemas');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  const mongooseClient = app.get('mongoose');
  const { Schema } = mongooseClient;

  return {
    accounts: [{type: Schema.Types.ObjectId, ref: 'accounts'}],
    stores: [{type: Schema.Types.ObjectId, ref: 'stores'}],


    ...Common.commonFieldsFn(app).obj,
  };
};
