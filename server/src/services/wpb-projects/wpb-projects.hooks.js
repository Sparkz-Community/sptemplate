const {hooks: {relate}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');

// const {fastJoin} = require('feathers-hooks-common');
const deleteChildren = require('../../hooks/delete-children');

// const pageResolver = {
//   joins: {
//     sections: () => async (project, context) => {
//       // console.log('\n\n\npage fastjoin\n', context.params.$dontUpdatePage);
//       // console.log('\ndoing the project fastjoin', context.params.$projectFastJoin, '\n\n\n');
//       if (context.params.$dontUpdatePage) return project;
//       if (context.params.$projectFastJoin) {
//         let children;
//         let pageIds = lget(project, 'pages', []);
//         if (pageIds.length) {
//           await context.app.service('wpb-pages').find({
//             query: {
//               _id: {
//                 $in: pageIds,
//               },
//             },
//             paginate: false
//           })
//             .then(res => {
//               children = res;
//             })
//             .catch(err => {
//               console.error(err);
//             });
//         }
//         if (children) {
//           lset(project, '_fastjoin.pagesList', children);
//         }
//       }
//     }
//   }
// };

const relateOwnerId = async context => {
  let config = {
    paramsName: 'relateOwnerIdConfig',
    herePath: 'ownerId',
    therePath: 'projects',
    thereService: lget(context, 'result.modelName'),
    // thereService: 'users',
  };
  await relate('otm', config)(context);
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      relateOwnerId,
    ],
    update: [
      relateOwnerId,
    ],
    patch: [
      relateOwnerId,
    ],
    remove: [
      deleteChildren(),
      relateOwnerId,
    ],
  },

  after: {
    all: [
      // fastJoin(pageResolver)
    ],
    find: [],
    get: [],
    create: [
      relateOwnerId,
    ],
    update: [
      relateOwnerId,
    ],
    patch: [
      relateOwnerId,
    ],
    remove: [
      relateOwnerId,
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
