const {
  packages: {lodash: {lunset, lmergeWith}},
  extensionUtils: {schemaCustomizer},
} = require('@iy4u/common-utils');

const Common = require('./common.schemas');

function PagesSchema(app, {extend_schema = {}, schema_remove_paths = []} = {}) {
  const mongoose = app.get('mongoose');
  const {Schema} = mongoose;
  const orig_schema = {
    name: {type: String, required: true},
    project: {
      type: Schema.Types.ObjectId,
      ref: 'wpb-projects',
      required() {
        return !this.template;
      },
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      refPath: 'modelName',
      required: function () {
        return !this.template;
      },
    },
    isPublic: {type: Boolean},
    modelName: {
      type: String,
      enum: ['users'],
      required: function () {
        return !this.template;
      },
    },
    stylingChoice: {type: String, required: false, enum: ['styles', 'classes', 'combination'], default: 'styles'},
    sections: [{type: Schema.Types.ObjectId, ref: 'wpb-sections'}],
    styles: {type: Schema.Types.Mixed},
    classes: [{
      id: {type: Schema.Types.ObjectId, ref: 'wpb-css-rules', required: true},
      classValue: {type: String, required: true},
      label: {type: String, required: true},
    }],
    template: {type: Boolean, required: false, default: false},

    ...Common.commonFieldsFn(app).obj,
  };

  schema_remove_paths.map(path => lunset(orig_schema, path));

  return new Schema(lmergeWith(orig_schema, extend_schema, schemaCustomizer), {
    _id: false, timestamps: false,
  });
}

function SectionsSchema(app, {extend_schema = {}, schema_remove_paths = []} = {}) {
  const mongoose = app.get('mongoose');
  const {Schema} = mongoose;
  const orig_schema = {
    page: {
      type: Schema.Types.ObjectId,
      ref: 'wpb-pages',
      required: function () {
        return !this.template === true;
      },
    },
    styles: {type: Schema.Types.Mixed},
    classes: [{
      id: {type: Schema.Types.ObjectId, ref: 'wpb-css-rules', required: true},
      classValue: {type: String, required: true},
      label: {type: String, required: true},
    }],
    stylingChoice: {type: String, required: false, enum: ['styles', 'classes', 'combination'], default: 'styles'},
    isPublic: {type: Boolean},
    devTemplate: {type: Boolean},
    template: {type: Boolean, required: false, default: false},
    baseSection: {type: Boolean, required: false, default: false},
    saveAsPage: {type: Boolean},
    ownerId: {type: Schema.Types.ObjectId, ref: 'users'},
    name: {type: String},
    icon: {type: String},
    parent: {type: Schema.Types.ObjectId, ref: 'wpb-sections'},
    children: [{type: Schema.Types.ObjectId, ref: 'wpb-sections'}],
    elements: [{type: Schema.Types.ObjectId, ref: 'wpb-elements'}],
    active: {type: Boolean, default: true},

    ...Common.commonFieldsFn(app).obj,
  };

  schema_remove_paths.map(path => lunset(orig_schema, path));

  return new Schema(lmergeWith(orig_schema, extend_schema, schemaCustomizer), {
    _id: false, timestamps: false,
  });
}

function ElementSchema(app, {extend_schema = {}, schema_remove_paths = []} = {}) {
  const mongoose = app.get('mongoose');
  const {Schema} = mongoose;
  const orig_schema = {
    styles: {type: Schema.Types.Mixed},
    classes: [{
      id: {type: Schema.Types.ObjectId, ref: 'wpb-css-rules', required: true},
      classValue: {type: String, required: true},
      label: {type: String, required: true},
    }],
    name: {type: String},
    icon: {type: String},
    isPublic: {type: Boolean},
    ownerId: {type: Schema.Types.ObjectId, ref: 'users'},
    devTemplate: {type: Boolean},
    template: {type: Boolean, required: false, default: false},
    baseElement: {type: Boolean, required: false, default: false},
    section: {
      type: Schema.Types.ObjectId,
      ref: 'wpb-sections',
      required: function () {
        return !this.template && !this.baseElement;
      },
    },
    stylingChoice: {type: String, required: false, enum: ['styles', 'classes', 'combination'], default: 'styles'},
    combinationPrecedence: {type: String, required: false, enum: ['styles', 'classes'], default: 'styles'},

    ...Common.commonFieldsFn(app).obj,
  };

  schema_remove_paths.map(path => lunset(orig_schema, path));

  return new Schema(lmergeWith(orig_schema, extend_schema, schemaCustomizer), {
    _id: false, timestamps: false,
  });
}

function ElementTypes(app) {
  const mongoose = app.get('mongoose');
  const {Schema} = mongoose;

  let options = {
    discriminatorKey: '_type',
    timestamps: true,
  };

  return {
    Text: new Schema({
      content: {type: String, required: true},
    }, {...options}),
    Editor: new Schema({
      content: {type: String, required: true},
    }, {...options}),
    Image: new Schema({
      ...Common.Images(app).obj,
    }, {...options}),
    Hyperlink: new Schema({
      url: {type: String, required: true},
      target: {type: String, default: '_blank', required: false},
      content: {type: String, required: true},
    }, {...options}),
    Icon: new Schema({
      attrs: {
        name: {type: String, required: true},
        size: {type: String},
        color: {type: String},
      },
    }, {...options}),
    Button: new Schema({
      label: {type: String, required: true},
      to: {type: String, required: true},
      attrs: {
        flat: {type: Boolean, default: false},
        outline: {type: Boolean},
        unelevated: {type: Boolean},
        rounded: {type: Boolean},
        round: {type: Boolean},
        push: {type: Boolean},
        dense: {type: Boolean},
        stack: {type: Boolean},
        glossy: {type: Boolean},
        icon: {type: String},
        iconRight: {type: String},
        color: {type: String},
      },
    }, {...options}),
    Map: new Schema({
      src: {type: String, required: true},
    }, {...options}),
    YoutubeVideo: new Schema({
      src: {type: String, required: true},
      attrs: {
        loop: {type: Boolean},
        controls: {type: Boolean},
        autoplay: {type: Boolean},
        muted: {type: Boolean},
      },
    }, {...options}),
    ImgCarousel: new Schema({
      slides: [{
        src: {type: String},
        name: {type: String},
      }],
      attrs: {
        swipeable: {type: Boolean},
        animated: {type: Boolean},
        fullscreen: {type: Boolean},
        thumbnails: {type: Boolean},
        navigation: {type: Boolean},
        infinite: {type: Boolean},
        autoplaySwitch: {type: Boolean},
        arrows: {type: Boolean},
        autoplay: {type: Number},
        transitionPrev: {type: String},
        transitionNext: {type: String},
      },
    }),
    ContactForm: new Schema({
      to: {type: String, required: true},
      successMessage: {type: String},
      'button-attrs': {
        label: {type: String},
        rounded: {type: Boolean},
        flat: {type: Boolean},
        glossy: {type: Boolean},
        outlined: {type: Boolean},
        push: {type: Boolean},
        size: {type: String},
        styles: {type: Schema.Types.Mixed},
      },
      'input-attrs': {
        filled: {type: Boolean},
        outlined: {type: Boolean},
        borderless: {type: Boolean},
        square: {type: Boolean},
        rounded: {type: Boolean},
        dense: {type: Boolean},
        standout: {type: Boolean},
      },
    }, {...options}),
  };
}

module.exports = {
  PagesSchema,
  SectionsSchema,
  ElementSchema,
  ElementTypes,
};
