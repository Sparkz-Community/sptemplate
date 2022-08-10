// const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');
const {hooks: {relate}} = require('@iy4u/common-server-lib');

const relateStyleSheet = async context => {
  const config = {
    herePath: 'styleSheet',
    therePath: 'rules',
    thereService: 'wpb-stylesheets',
    noTransaction: true,
  };
  await relate('otm', config)(context);
};

// const relateOthers = async context => {
//   const onPages = lget(context, 'result.onPages', []);
//   const onSections = lget(context, 'result.onSections', []);
//   const onElements = lget(context, 'result.onElements', []);
//   if (onPages.length) {
//     const pageConfig = {
//       herePath: 'onPages',
//       therePath: 'rules',
//       thereService: 'wpb-pages',
//     };
//     await relate('mtm', pageConfig)(context);
//   }
//   if (onSections.length) {
//     const sectionConfig = {
//       herePath: 'onSections',
//       therePath: 'rules',
//       thereService: 'wpb-sections',
//     };
//     await relate('mtm', sectionConfig)(context);
//   }
//   if (onElements.length) {
//     const elementConfig = {
//       herePath: 'onElements',
//       therePath: 'rules',
//       thereService: 'wpb-elements',
//     };
//     await relate('mtm', elementConfig)(context);
//   }
// };

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      // relateOthers,
      relateStyleSheet,
    ],
    update: [
      // relateOthers,
      relateStyleSheet,
    ],
    patch: [
      // relateOthers,
      relateStyleSheet,
    ],
    remove: [
      // relateOthers,
      relateStyleSheet,
    ],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      // relateOthers,
      relateStyleSheet,
    ],
    update: [
      // relateOthers,
      relateStyleSheet,
    ],
    patch: [
      // relateOthers,
      relateStyleSheet,
    ],
    remove: [
      // relateOthers,
      relateStyleSheet,
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
