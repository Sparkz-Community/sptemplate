const {utils: {coreCall}} = require('@iy4u/common-server-lib');

function syncActive(context) {
  let publication = context.result;
  if (publication.active) {
    coreCall(context, 'wpb-page-publications').patch(null, {active: false}, {
      query: {
        _id: {$ne: publication._id},
        page_id: publication.page_id,
      },
    });
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      syncActive,
    ],
    update: [
      syncActive,
    ],
    patch: [
      syncActive,
    ],
    remove: [],
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
