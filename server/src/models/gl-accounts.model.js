// // warehouses-model.js - A mongoose model
// //
// // See http://mongoosejs.com/docs/models.html
// // for more of what you can do here.
// const {packages: {lodash: {lunset, lmergeWith}}, extensionUtils: {schemaCustomizer}} = require('@iy4u/common-utils');
//
// const Common = require('./common/common.schemas');
// module.exports = function (app, {connection, extend_schema = {}, schema_remove_paths = [], options_remove_paths = [], extend_options = {}} = {}) {
//   const mongoose = app.get('mongoose');
//   const mongooseClient = connection;
//   const {Schema} = mongoose;
//   const modelName = 'warehouses';
//
//   // const classesBase = {
//   //   timestamps: true,
//   //   discriminatorKey: '_type'
//   // };
//   const Classes = [{Lead: {}}, {Customer: {}}, {Vendor: {}}, {Partner: {}}, {Employee: {}}];
//
//   const baseOptions = {
//     timestamps: true,
//     discriminatorKey: '_type'
//   };
//
//   const baseSchema = {
//     name: { type: String, required: true },
//     // classes: {
//     //   type: [classesBase],
//     //   default() {
//     //     return [{_type: 'collection'}];
//     //   },
//     // },
//     address: Common.Address(app).obj,
//
//     ...Common.commonFieldsFn(app).obj,
//   };
//
//   schema_remove_paths.map(path => lunset(baseSchema, path));
//   options_remove_paths.map(path => lunset(baseOptions, path));
//
//   const schema = new Schema(
//     lmergeWith(baseSchema, extend_schema, schemaCustomizer),
//     lmergeWith(baseOptions, extend_options, schemaCustomizer)
//   );
//
//   for (const Class of Classes) {
//     Object.entries(Class).forEach(([key, value]) => {
//       schema.path('classes').discriminator(key, value);
//     });
//   }
//
//   // This is necessary to avoid model compilation errors in watch mode
//   // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
//   if (mongooseClient.modelNames().includes(modelName)) {
//     mongooseClient.deleteModel(modelName);
//   }
//   return mongooseClient.model(modelName, schema);
//
// };


// leads-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const Common = require('./common/common.schemas');

module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'gl-accounts';
  const schema = new Schema({
    name: { type: String, required: true },
    parent: {type: Schema.Types.ObjectId, ref: 'gl-accounts'},
    children: [{type: Schema.Types.ObjectId, ref: 'gl-accounts'}],
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
