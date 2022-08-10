const {fastJoin} = require('feathers-hooks-common');
const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {setField} = require('feathers-authentication-hooks');

const deleteChildren = require('../../hooks/delete-children');

/*function treeCompiler(arr, parentPath) {
  return arr.map((item, index) => {
    const myPath = !parentPath ? `_fastjoin.sections[${index}]` : parentPath + `._fastjoin.children[${index}]`;
    let sections = lget(item, '_fastjoin.children', []);
    let elements = lget(item, '_fastjoin.elements', []);
    elements = elements.map((item, index) => ({...item, pathToMe: parentPath + `._fastjoin.elements[${index}]`}));
    if (sections.length) {
      sections = treeCompiler(sections, myPath);
    }
    lset(item, 'tree_children', [...elements, ...sections]);
    lset(item, 'pathToMe', myPath);
    item.tree_children.sort((curr, next) => {
      return curr.styles.order - next.styles.order;
    });
    return item;
  });
}*/

const setEnvironment = setField({
  from: 'params.coreContext.environment._id',
  as: 'data.environment',
});

const sectionResolver = {
  joins: {
    sections: () => async (page, context) => {
      // console.log('this is the context at joins', context);
      // console.log('this is the page at joins', page);
      // console.log(`\n\n\nshould page ${context.method}ing do the page fastjoin\n`, !context.params.$dontUpdatePage);
      if (context.params.$dontUpdatePage) return page;
      // console.log('\ndoing the page fastjoin', context.params.$dontUpdatePage, '\n\n\n');
      let children;
      let sectionIds = lget(page, 'sections', []);
      if (sectionIds.length) {
        await coreCall(context, 'wpb-sections').find({
          query: {
            _id: {$in: sectionIds},
            $or: [
              {parent: {$exists: false}},
              {parent: null},
            ],

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
        // let tree = [{
        //   ...page,
        //   _type: 'page',
        //   tree_children: treeCompiler(children, null)
        // }];
        lset(page, '_fastjoin.sections', children);
        // lset(page, '_fastjoin.tree', tree);
      }
    },
  },
};

const fontResolver = {
  joins: {
    fonts: () => async (page, context) => {
      await context.app.service('wpb-pages').Model.aggregate(
        [
          {
            '$match': {
              'styles.font-family': {
                '$ne': null,
              },
              '_id': page._id,
            },
          },
          {
            '$project': {
              'font-families': '$styles.font-family',
              '_id': 0,
            },
          },
          {
            $unionWith: {
              coll: 'wpb-sections',
              pipeline: [
                {
                  '$match': {
                    'styles.font-family': {
                      '$ne': null,
                    },
                    'page': page._id,
                  },
                },
                {
                  '$project': {
                    'font-families': '$styles.font-family',
                  },
                },
              ],
            },
          },
          {
            $unionWith: {
              coll: 'wpb-elements',
              pipeline: [
                {
                  '$match': {
                    'styles.font-family': {
                      '$ne': null,
                    },
                    section: {$in: page.sections},
                  },
                },
                {
                  '$project': {
                    'font-families': '$styles.font-family',
                    '_id': 0,
                  },
                },
              ],
            },
          },
          {
            '$group': {
              '_id': null,
              'distinct': {
                '$addToSet': '$$ROOT',
              },
            },
          },
          {
            '$unwind': {
              'path': '$distinct',
              'preserveNullAndEmptyArrays': false,
            },
          },
          {
            '$replaceRoot': {
              'newRoot': '$distinct',
            },
          },
          {
            '$group': {
              '_id': null,
              'font-families': {
                '$addToSet': '$font-families',
              },
            },
          },
        ],
      ).then((res) => {
        lset(page, '_fastjoin.fonts', lget(res, [0, 'font-families'], []));
      })
        .catch((err) => {
          console.error(err);
        });
    },
  },
};

const cssResolver = {
  joins: {
    styleSheetCss: () => async (page, context) => {
      let styleSheets = await coreCall(context, 'wpb-stylesheets').find({
        query: {projects: page.project},
        paginate: false,
      });
      if (styleSheets.length) {
        let reOrder = styleSheets.sort((curr, next) => {
          return curr.order - next.order;
        });
        let rules = reOrder.reduce((acc, curr) => {
          return [...acc, ...lget(curr, '_fastjoin.rules', [])];
        }, []);
        let combineCssStrings = reOrder.reduce((acc, curr) => {
          return acc + curr.cssString;
        }, '');
        let prependedString = await coreCall(context, 'wpb-jss-conversion').create({
          action: 'prependCss',
          value: combineCssStrings,
          prepend: String(page.project),
        });
        if (prependedString) {
          lset(page, '_fastjoin.css', prependedString);
        } else {
          lset(page, '_fastjoin.css', '');
        }
        lset(page, '_fastjoin.cssRules', rules);
      }
    },
  },
};

const relateProject = async context => {
  let config = {
    herePath: 'project',
    therePath: 'pages',
    thereService: 'wpb-projects',
    noTransaction: true,
  };
  await relate('otm', config)(context);
};

const relateClasses = async context => {
  let config = {
    paramsName: 'relateClassesConfig',
    herePath: 'classes',
    therePath: 'onPages',
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

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      relateProject,
      relateClasses,
      setEnvironment,
    ],
    update: [
      relateProject,
      relateClasses,
      setEnvironment,
    ],
    patch: [
      relateProject,
      relateClasses,
      setEnvironment,
    ],
    remove: [
      deleteChildren(),
      relateProject,
      relateClasses,
    ],
  },

  after: {
    all: [
      fastJoin(fontResolver),
      fastJoin(sectionResolver),
      fastJoin(cssResolver),
    ],
    find: [],
    get: [],
    create: [
      relateProject,
      relateClasses,
    ],
    update: [
      relateProject,
      relateClasses,
    ],
    patch: [
      relateProject,
      relateClasses,
    ],
    remove: [
      relateProject,
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
