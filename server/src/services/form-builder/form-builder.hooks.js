const { authenticate } = require('@feathersjs/authentication').hooks;
const {packages: {lodash: {lget, lisEmpty}}} = require('@iy4u/common-utils');
const { populate } = require('feathers-graph-populate');
const {hooks: {relaters: {relateOtm, removeOtm}}} = require('@iy4u/common-server-lib');


const populates = {
  responses: {
    service: 'form-builder-responses',
    nameAs: 'responseList',
    keyHere: 'responses',
    keyThere: '_id',
    asArray: false,
    params: {}
  },
};
const namedQueries = {
  withResponses: {
    responses: {}
  }
};

const relateHost = async context => {
  let envHost = context.app.get('appHosts').service;
  let hostService = envHost ? envHost : 'app-hosts';
  let config = {
    herePath: 'appHost',
    therePath: 'forms',
    thereService: hostService,
    paramsName: 'relateHost'
  };
  // eslint-disable-next-line no-console
  console.log('relating form builder', hostService);
  if(context.method === 'remove') await removeOtm(config)(context);
  else await relateOtm(config)(context)
    .then(res => {
      // eslint-disable-next-line no-console
      console.log('form builder relate res', res, context);
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.error('form builder relate err', err);
    });
};

const uniquePath = context => {
  let fields = lget(context, 'data.fields', []);
  //console.log('fields', fields);
  if (Array.isArray(fields)) {
    let names = [];
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      //console.log('field before', field.path);
      if (!names.includes(field.label)) {
        names.push(field.label);
      } else {
        field.label += String(i);
        names.push(field.label);
      }
      fields[i].path = field.label;
      //console.log('field after', field.path, fields[i].path);
    }
  }
  return context;
};

const rmvFalseIds = context => {
  if(context.data.fields){
    context.data.fields.forEach(field => {
      if(field._id && field._id.indexOf('field') > -1){
        delete field._id;
      }
    });
  }
  return context;
};

const relateParent = async context => {
  const config = {
    herePath: 'parent',
    therePath: 'children',
    thereService: 'form-builder',
    paramsName: 'relateParent'
  };
  if(context.method === 'remove') await removeOtm(config)(context);
  else await relateOtm(config)(context);
};


// eslint-disable-next-line no-unused-vars
const onlyUserPatch = context => {
  let userId = lget(context, 'user._id', lget(context, 'params.user._id'));
  let owner = lget(context, 'data.owner');
  //console.log('got owner', owner, userId);
  if (JSON.stringify(owner) === JSON.stringify(userId)) return context;
  else throw new Error('Cannot update forms you did not create');
};

const setNext = async context => {
  let fields = lget(context.result, 'fields', []);
  if(lget(fields, [0])) {
    let changed = false;
    fields.forEach((field, i) => {
      if (lget(fields, i + 1)) {
        let arr = [];
        if (lget(field, 'next[0]')) {
          arr = field.next.filter(a => !lisEmpty(a.if));
        }
        let obj = { field: lget(fields, [i + 1, '_id']) };
        arr ? arr.unshift(obj) : arr = [ obj ];
        field.next = arr;
        changed = true;
      }
    });
    if(changed) context.result = await context.app.service('form-builder')._patch(context.result._id, { fields: fields });
  }
  return context;
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate('jwt'), rmvFalseIds, uniquePath, relateHost, relateParent],
    update: [uniquePath, relateHost, relateParent],
    patch: [uniquePath,rmvFalseIds, relateHost, relateParent],
    remove: [authenticate('jwt')]
  },

  after: {
    all: [populate({ populates, namedQueries })],
    find: [],
    get: [],
    create: [relateHost, relateParent, setNext],
    update: [relateHost, relateParent, setNext],
    patch: [relateHost, relateParent, setNext],
    remove: [relateHost, relateParent]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
