// accounts-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
// const Common = require('./common/common.schemas');

// function isStream(stream) {
//   return stream !== null
//     && typeof stream === 'object'
//     && typeof stream.pipe === 'function';
// }
//
// function isString(str) {
//   return typeof str === 'string' || str instanceof String;
// }

// eslint-disable-next-line no-unused-vars
const Common = require('./common/common.schemas');
module.exports = function (app) {
  const mongooseClient = app.get('mongoose');
  const {Schema} = mongooseClient;

  const Attachment = new Schema({
    filename: String, // - filename to be reported as the name of the attached file. Use of unicode is allowed.
    // content: { // - String, Buffer or a Stream contents for the attachment
    //   type: Schema.Types.Mixed,
    //   validate: {
    //     validator: (value) => isString(value) || Buffer.isBuffer(value) || isStream(value),
    //     message: props => `The value of field 'content' must match one of: ['string', 'buffer', 'stream']. got ${typeof props.value}`,
    //   },
    // },
    path: String, // - path to the file if you want to stream the file instead of including it (better for larger attachments)
    href: String, // – a URL to the file (data uris are allowed as well)
    httpHeaders: {type: Schema.Types.Mixed}, // - optional HTTP headers to pass on with the href request, eg. {authorization: "bearer ..."}
    contentType: String, //- optional content type for the attachment, if not set will be derived from the filename property
    contentDisposition: {type: String, default: 'attachment'}, //- optional content disposition type for the attachment, defaults to ‘attachment’
    cid: String, // - optional content id for using inline images in HTML message source
    encoding: {type: String, default: 'base64', enum: ['base64', 'hex', 'binary']}, // - If set and content is string, then encodes the content to a Buffer using the specified encoding. Example values: ‘base64’, ‘hex’, ‘binary’ etc. Useful if you want to use binary attachments in a JSON formatted email object.
    headers: {type: Schema.Types.Mixed},//- custom headers for the attachment node. Same usage as with message headers
    raw: {type: Schema.Types.Mixed}, // - is an optional special value that overrides entire contents of current mime node including mime headers. Useful if you want to prepare node contents yourself
  });

  return {
    from: {type: Schema.ObjectId, ref: 'accounts'},
    to: [{type: Schema.ObjectId, ref: 'accounts'}],
    isExternal: {type: Boolean, default: true},
    replies: [
      {
        from: {type: Schema.ObjectId, ref: 'accounts'},
        body: {type: String, required: true},
        attachments: [Attachment],
      },
    ],
    ...Common.commonFieldsFn(app).obj,
  };
};
