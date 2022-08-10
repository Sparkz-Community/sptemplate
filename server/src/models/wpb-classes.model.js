// wpb-classes-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app, {connection} = {}) {
  const mongoose = app.get('mongoose');
  const mongooseClient = connection;
  const {Schema} = mongoose;
  const modelName = 'wpb-classes';

  const schema = new Schema({
    // inProjects: [{type: Schema.Types.ObjectId, required: true, ref: 'wpb-projects'}],
    // attachedTo: [{
    //   id: {type: Schema.Types.ObjectId, required: true, refPath: 'modelName'},
    //   modelName: {type: String, required: false, enum: ['wpb-elements', 'wpb-sections', 'wpb-pages']},
    // }],
    styles: {type: Schema.Types.Mixed, required: true},
    name: {type: String, required: true},
    // inPages: [{type: Schema.Types.ObjectId, required: true, ref: 'wpb-pages'}],
  }, {
    timestamps: true,
  });

  // schema.pre('save', function(next) {
  //   let name = this.name.split('-');
  //   const id = String(this._id);
  //   if(name.length && name.length !== 2) {
  //     name = id + '-' + this.name[0];
  //   }
  //   this.name = name;
  //   next();
  // });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};
