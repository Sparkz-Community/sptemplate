// const {relateOtm, removeOtm} = require('@ionrev/ir-feathers-relate');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {setField} = require('feathers-authentication-hooks');

const reorderCheck = require('../../hooks/reorderCheck');


const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const relateSection = async context => {
  let config = {
    herePath: 'section',
    therePath: 'elements',
    thereService: 'wpb-sections',
    noTransaction: true,
  };
  await relate('otm', config)(context);
};

const relateClasses = async context => {
  let config = {
    paramsName: 'relateClassesConfig',
    herePath: 'classes',
    therePath: 'onElements',
    thereService: 'wpb-css-rules',
    noTransaction: true,
    beforeHooks: [
      context => {
        if (context.method === 'remove') {
          let fkIds = lget(context, ['params', 'removeMtm', 'relateClassesConfig', 'fkIds'], []);
          if (fkIds.length) {
            lset(context, ['params', 'removeMtm', 'relateClassesConfig', 'fkIds'], fkIds.map(item => {
              return item.id;
            }));
          }
        } else {
          let newFkIds = lget(context, ['params', 'relateMtm', 'relateClassesConfig', 'newFkIds'], []);
          if (newFkIds.length) {
            lset(context, ['params', 'relateMtm', 'relateClassesConfig', 'newFkIds'], newFkIds.map(item => {
              return item.id;
            }));
          }

          let removedFkIds = lget(context, ['params', 'relateMtm', 'relateClassesConfig', 'removedFkIds'], []);
          if (removedFkIds.length) {
            lset(context, ['params', 'relateMtm', 'relateClassesConfig', 'removedFkIds'], removedFkIds.map(item => {
              return item.id;
            }));
          }
        }
        return context;
      },
    ],
  };
  await relate('mtm', config)(context);
};

async function channelUpdateCheck(context) {
  if (context.params.$dontUpdatePage) return context;
  const sectionId = lget(context, 'result.section');
  if (sectionId) {
    let section = await coreCall(context, 'wpb-sections').get(sectionId);
    if (section) {
      let pageId = lget(section, 'page');
      if (pageId) {
        let page = await coreCall(context, 'wpb-pages').get(pageId);
        if (page) {
          await context.app.service('wpb-pages').emit('updated', page);
        }
      }
    }
  }
}

function deleteImage(context) {
  let type = context.result._type;
  let image = context.result.large;
  if (type === 'image' && lget(image, '_id')) {
    coreCall(context, 'file-uploader').remove(image._id)
      .catch(err => {
        throw err;
      });
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      relateSection,
      relateClasses,
      setEnvironment,
    ],
    update: [
      reorderCheck(),
      relateSection,
      relateClasses,
      setEnvironment,
    ],
    patch: [
      reorderCheck(),
      relateSection,
      relateClasses,
      setEnvironment,
    ],
    remove: [
      reorderCheck(),
      relateSection,
      relateClasses,
    ],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      reorderCheck(),
      channelUpdateCheck,
      relateSection,
      relateClasses,
    ],
    update: [
      reorderCheck(),
      channelUpdateCheck,
      relateSection,
      relateClasses,
    ],
    patch: [
      reorderCheck(),
      channelUpdateCheck,
      relateSection,
      relateClasses,
    ],
    remove: [
      channelUpdateCheck,
      deleteImage,
      relateSection,
      relateClasses,
    ],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
