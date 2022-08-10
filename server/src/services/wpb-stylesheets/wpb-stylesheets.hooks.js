const {fastJoin} = require('feathers-hooks-common');
const {hooks: {relate}, utils: {coreCall}} = require('@iy4u/common-server-lib');
const {packages: {lodash: {lget, lset}}} = require('@iy4u/common-utils');
const {cssToJss, jssToCss} = require('jss-cli');

async function ruleParser(ctx) {
  if (ctx.type === 'before') {
    if (ctx.id) {
      let beforeRecord = await coreCall(ctx, 'wpb-stylesheets').get(ctx.id);
      if (beforeRecord) lset(ctx, 'params.beforeRecord', beforeRecord);
    }
  }
  if (ctx.type === 'after') {
    let beforeRecord = lget(ctx, 'params.beforeRecord');
    if (beforeRecord && ctx.result.cssString !== beforeRecord.cssString) {
      let parsedCss = cssToJss({code: ctx.result.cssString});
      console.log('Parsed css: ', parsedCss);
      let parts;
      if ('@global' in parsedCss) {
        parts = Object.keys(parsedCss['@global']).map((key, index) => {
          return {value: parsedCss['@global'][key], name: key, order: index, styleSheet: ctx.result._id};
        });
      }
      let partNames = parts.map(part => part.name);
      console.log('Parts', parts);
      let rules = await coreCall(ctx, 'wpb-css-rules').find({query: {styleSheet: ctx.result._id}, paginate: false});
      let existingRuleIds = rules.map(rule => String(rule._id));
      let resultRulesCheck = ctx.result.rules.filter(ruleId => !existingRuleIds.includes(String(ruleId)));
      let existingRulesCheck = rules.filter(rule => !partNames.includes(rule.name));
      let toRemove = [...resultRulesCheck, ...existingRulesCheck];
      if (rules.length) {
        let toPatch = [];
        let toCreate = parts.reduce((acc, curr) => {
          let existing = rules.find(rule => rule.name === curr.name);
          if (!existing) return [...acc, curr];
          let partString = jssToCss({styles: {'@global': {[curr.name]: curr.value}}});
          let existingString = jssToCss({styles: {'@global': {[existing.name]: existing.value}}});
          if (partString !== existingString) {
            toPatch.push({...existing, ...curr});
          }
          return acc;
        }, []);
        await Promise.all([
          Promise.all(toPatch.map(rule => coreCall(ctx, 'wpb-css-rules').patch(rule._id, rule))),
          Promise.all(toCreate.map(rule => coreCall(ctx, 'wpb-css-rules').create(rule))),
          Promise.all(toRemove.map(id => coreCall(ctx, 'wpb-css-rules').remove(id))),
        ]);
        return ctx;
      } else {
        return await Promise.all(parts.map(part => {
          return coreCall(ctx, 'wpb-css-rules').create(part);
        }))
          .then(() => {
            return ctx;
          })
          .catch(err => {
            console.error(err);
          });
      }
    }
  }
}

async function removeDependants(context) {
  const self = await coreCall(context, 'wpb-stylesheets').get(context.id);
  const rules = lget(self, 'rules', []);
  if (rules.length) {
    await Promise.all(rules.map(id => {
      return coreCall(context, 'wpb-css-rules').remove(id);
    }));
  }
  return context;
}

let relateProjects = async context => {
  const config = {
    herePath: 'projects',
    therePath: 'styleSheets',
    thereService: 'wpb-projects',
    noTransaction: true,
  };
  await relate('mtm', config)(context);
};

async function updatePageCheck(context) {
  let pageId = lget(context, 'params.$stylesheetUpdatePage');
  if (pageId) {
    let page = await coreCall(context, 'wpb-pages').get(pageId);
    if (page) {
      context.app.service('wpb-pages').emit('updated', page);
    }
  }
}

const rulesResolver = {
  joins: {
    rules: () => async (stylesheet, context) => {
      let rules = await coreCall(context, 'wpb-css-rules').find({
        query: {_id: {$in: stylesheet.rules}},
        paginate: false,
      });
      lset(stylesheet, '_fastjoin.rules', rules);
    },
  },
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [
      relateProjects,
    ],
    patch: [
      relateProjects,
      ruleParser,
    ],
    remove: [
      removeDependants,
    ],
  },

  after: {
    all: [
      fastJoin(rulesResolver),
    ],
    find: [],
    get: [],
    create: [
      relateProjects,
    ],
    update: [
      relateProjects,
      updatePageCheck,
    ],
    patch: [
      relateProjects,
      updatePageCheck,
      ruleParser,
    ],
    remove: [
      relateProjects,
      updatePageCheck,
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
