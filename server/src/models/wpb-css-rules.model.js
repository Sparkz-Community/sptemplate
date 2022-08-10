// wpb-css-rules-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'wpb-css-rules';

  const schema = new Schema({
    styleSheet: {type: Schema.Types.ObjectId, ref: 'wpb-stylesheets', required: true},
    value: {type: Schema.Types.Mixed, required: true},
    name: {type: String, required: true},
    order: {type: Number, required: true},
    onPages: [{type: Schema.Types.ObjectId, ref: 'wpb-pages'}],
    onSections: [{type: Schema.Types.ObjectId, ref: 'wpb-sections'}],
    onElements: [{type: Schema.Types.ObjectId, ref: 'wpb-elements'}],
    // inProjects: [{type: Schema.Types.ObjectId, required: true, ref: 'wpb-projects'}],
    // attachedTo: [{
    //   id: {type: Schema.Types.ObjectId, required: true, refPath: 'modelName'},
    //   modelName: {type: String, required: false, enum: ['wpb-elements', 'wpb-sections', 'wpb-pages']},
    // }],
    // styles: {type: Schema.Types.Mixed, required: true},
    // name: {type: String, required: true},
    // inPages: [{type: Schema.Types.ObjectId, required: true, ref: 'wpb-pages'}],
  }, {timeStamps: true});

  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }

  return mongooseClient.model(modelName, schema);

  // const declarationBaseSchema = new Schema({
  //   type: {type: String, required: true},
  // }, options);
  //
  //
  // const declarationSchema = new Schema({
  //   property: {type: String, required: true},
  //   value: {type: String, required: false}
  // }, options);
  //
  //
  // const keyframeKeyframeSchema = new Schema({
  //   values: [{type: String, required: true}],
  //   declarations: [declarationBaseSchema]
  // }, options);
  //
  //
  // const commentSchema = new Schema({
  //   comment: {type: String, required: false}
  // }, options);
  //
  // keyframeKeyframeSchema.path('declarations').discriminator('comment', commentSchema);
  // keyframeKeyframeSchema.path('declarations').discriminator('declaration', declarationSchema);
  //
  //
  //
  //
  // const mediaRuleSchema = new Schema({
  //   selectors: [String],
  //   declarations: [declarationBaseSchema]
  // }, options);
  //
  // mediaRuleSchema.path('declarations').discriminator('comment', commentSchema);
  // mediaRuleSchema.path('declarations').discriminator('declaration', declarationSchema);
  //
  //
  // let schemaTypes = {
  //   charset: new Schema({
  //     charset: {type: String, required: true}
  //   }, options),
  //   'import': new Schema({
  //     'import': {type: String, required: true}
  //   }, options),
  //   namespace: new Schema({
  //     namespace: {type: String, required: true}
  //   }, options),
  //   'font-face': new Schema({
  //     declarations: [declarationBaseSchema]
  //   }, options),
  //   rule: new Schema({
  //     declarations: [declarationBaseSchema],
  //     selectors: [{type: String, required: true}]
  //   }, options),
  //   keyframes: new Schema({
  //     name: {type: String, required: true},
  //     keyframes: [declarationBaseSchema]
  //   }, options),
  //   media: new Schema({
  //     media: String,
  //     rules: [declarationBaseSchema]
  //   }, options),
  //   supports: new Schema({
  //     supports: String,
  //     rules: [declarationBaseSchema]
  //   }, options),
  //   page: new Schema({
  //     declarations: [declarationBaseSchema],
  //     selectors: [{type: String, required: false}],
  //   }, options)
  // };
  //
  // schemaTypes['font-face'].path('declarations').discriminator('comment', commentSchema);
  // schemaTypes['font-face'].path('declarations').discriminator('declaration', declarationSchema);
  // schemaTypes.rule.path('declarations').discriminator('comment', commentSchema);
  // schemaTypes.rule.path('declarations').discriminator('declaration', declarationSchema);
  // schemaTypes.keyframes.path('keyframes').discriminator('keyframe', keyframeKeyframeSchema);
  // schemaTypes.keyframes.path('keyframes').discriminator('comment', commentSchema);
  // schemaTypes.media.path('rules').discriminator('rule', mediaRuleSchema);
  // schemaTypes.media.path('rules').discriminator('comment', commentSchema);
  // schemaTypes.supports.path('rules').discriminator('rule', mediaRuleSchema);
  // schemaTypes.supports.path('rules').discriminator('comment', commentSchema);
  // schemaTypes.page.path('declarations').discriminator('declaration', declarationSchema);
  // schemaTypes.page.path('declarations').discriminator('comment', commentSchema);
  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel

};
