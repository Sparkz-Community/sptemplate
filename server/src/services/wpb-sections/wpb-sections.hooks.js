const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {fastJoin} = require('feathers-hooks-common');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {setField} = require('feathers-authentication-hooks');

const deleteChildren = require('../../hooks/delete-children');
// const reorderCheck = require('../../hooks/reorderCheck');

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});


const sectionResolver = {
  joins: {
    sections: () => async (section, context) => {
      if (context.params.$dontUpdatePage) return section;
      let children;
      let sectionIds = lget(section, 'children', []);
      if (sectionIds.length) {
        await coreCall(context, 'wpb-sections').find({
          query: {
            _id: {
              $in: sectionIds,
            },
          },
        })
          .then(res => {
            children = res.data;
          })
          .catch(err => {
            console.error(err);
          });
      }
      if (children) {
        children.sort((one, two) => {
          return one.styles.order - two.styles.order;
        });
        lset(section, '_fastjoin.children', children);
      }
    },
    elements: () => async (section, context) => {
      if (context.params.$dontUpdatePage) return section;
      let elements;
      let elementIds = lget(section, 'elements', []);
      if (elementIds.length) {
        await coreCall(context, 'wpb-elements').find({
          query: {
            _id: {
              $in: elementIds,
            },
          },
        })
          .then(res => {
            elements = res.data;
          })
          .catch(err => {
            console.error(err);
          });
      }
      if (elements) {
        elements.sort((one, two) => {
          return one.styles.order - two.styles.order;
        });
        lset(section, '_fastjoin.elements', elements);
      }
    },
  },
};

const relatePage = async context => {
  let config = {
    herePath: 'page',
    therePath: 'sections',
    thereService: 'wpb-pages',
    noTransaction: true,
  };
  await relate('otm', config)(context);
};

const relateParent = async context => {
  let config = {
    herePath: 'parent',
    therePath: 'children',
    thereService: 'wpb-sections',
    noTransaction: true,
  };
  await relate('otm', config)(context);
};

const relateClasses = async context => {
  let config = {
    paramsName: 'relateClassesConfig',
    herePath: 'classes',
    therePath: 'onSections',
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

const pageUpdate = async context => {
  if (context.params.$dontUpdatePage) return context;
  // console.log('pageUpdate', context.path, context.params.$dontUpdatePage);
  let pageId = lget(context.result, 'page');
  if (pageId) {
    let page = await coreCall(context, 'wpb-pages').get(pageId);
    context.app.service('wpb-pages').emit('updated', page);
  }
};


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      relatePage,
      relateParent,
      relateClasses,
      setEnvironment,
    ],
    update: [
      relatePage,
      relateParent,
      relateClasses,
      setEnvironment,
    ],
    patch: [
      relatePage,
      relateParent,
      relateClasses,
      setEnvironment,
    ],
    remove: [
      deleteChildren(),
      relatePage,
      relateParent,
      relateClasses,
    ],
  },

  after: {
    all: [
      fastJoin(sectionResolver),
    ],
    find: [],
    get: [],
    create: [
      relatePage,
      relateParent,
      relateClasses,
      pageUpdate,
    ],
    update: [
      relatePage,
      relateParent,
      relateClasses,
      pageUpdate,
    ],
    patch: [
      relatePage,
      relateParent,
      relateClasses,
      pageUpdate,
    ],
    remove: [
      relatePage,
      relateParent,
      relateClasses,
      pageUpdate,
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
