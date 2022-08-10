// const lget = require('lodash.get');

// async function relateDependants(context) {
//   if (context.params.$dontRelateClasses) return context;
//   const inPages = lget(context, 'result.inPages', []);
//   const attachedTo = lget(context, 'result.attachedTo', []);
//   let stopUpdate = context.params.$dontUpdatePage;
//   if (context.method === 'remove') {
//     if (attachedTo.length) {
//       await Promise.all(attachedTo.map(item => {
//         return context.app.service(item.modelName).patch(item.id, {$pull: {classes: context.result._id}}, {$dontUpdatePage: stopUpdate, $dontRelateClasses: true});
//       }));
//     }
//     if (inPages.length) {
//       await Promise.all(inPages.map(pageId => {
//         return context.app.service('wpb-pages').patch(pageId, {$pull: {classes: context.result._id}}, {$dontUpdatePage: stopUpdate, $dontRelateClasses: true});
//       }));
//     }
//   } else {
//     if (attachedTo.length) {
//       let dependants = await Promise.all(attachedTo.map(async item => {
//         return {
//           dependant: await context.app.service(item.modelName)._get(item.id, {$dontUpdatePage: stopUpdate, $dontRelateClasses: true}),
//           item: item
//         };
//       }));
//     }
//     if (inPages.length) {
//       let pagesList = await Promise.all(inPages.map(pageId => {
//         return context.app.service('wpb-pages')._get(pageId,{$dontUpdatePage: stopUpdate, $dontRelateClasses: true});
//       }));
//     }
//   }
//   return context;
// }


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [/*relateDependants*/],
    update: [/*relateDependants*/],
    patch: [/*relateDependants*/],
    remove: [/*relateDependants*/]
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
