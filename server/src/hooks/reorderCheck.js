const {packages: {lodash: {lget, lset, lisNumber}}} = require('@iy4u/common-utils');
const {utils: {coreCall}} = require('@iy4u/common-server-lib');
const {GeneralError} = require('@feathersjs/errors');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    const service = (val) => coreCall(context, val);
    if (['patch', 'update', 'create'].includes(context.method)) {
      if (context.type === 'before') {
        if (context.method === 'create') {
          lset(context, 'params.$reorder', {newOrder: lget(context, 'data.styles.order'), oldOrder: Infinity});
        } else {
          const self = await service(context.path).get(context.id);
          const dataOrder = lget(context, 'data.styles.order', undefined);
          const selfOrder = lget(self, 'styles.order', undefined);
          if (self && lisNumber(dataOrder) && lisNumber(selfOrder)) {
            let oldParent = lget(self, 'parent');
            let newParent = lget(context, 'data.parent');
            if (oldParent && newParent && oldParent !== newParent) {
              lset(context, 'params.$reorder', {newOrder: lget(context, 'data.styles.order'), oldOrder: Infinity});
            } else if (selfOrder !== dataOrder) {
              lset(context, 'params.$reorder', {newOrder: dataOrder, oldOrder: selfOrder});
            }
          }
        }
      } else if (context.type === 'after') {
        const self = context.result;
        if (self && context.params['$reorder']) {
          let parentInfo;
          if (self.section) {
            parentInfo = {service: 'wpb-sections', id: self.section};
          } else if (self.parent) {
            parentInfo = {service: 'wpb-sections', id: self.parent};
          } else if (self.page) {
            parentInfo = {service: 'wpb-pages', id: self.page};
          }
          if (parentInfo) {
            const parent = await service(parentInfo.service).get(parentInfo.id);
            if (parent) {
              const {newOrder, oldOrder} = context.params.$reorder;
              const movingUp = newOrder > oldOrder;
              const changeMe = (pos) => {
                if (!lisNumber(pos)) return false;
                const greaterThan = pos > oldOrder && pos <= newOrder;
                const lessThan = pos < oldOrder && pos >= newOrder;
                return (movingUp && greaterThan) || (!movingUp && lessThan);
              };
              const fastJoin = lget(parent, '_fastjoin', {});
              const changeOthers = Object.keys(fastJoin).reduce((acc, curr) => {
                if (Array.isArray(fastJoin[curr]) && ['sections', 'elements'].includes(curr)) {
                  return {
                    ...acc,
                    [curr]: fastJoin[curr].filter(item => {
                      let itemOrder = lget(item, 'styles.order');
                      return String(item._id) !== String(self._id) && changeMe(itemOrder);
                    }),
                  };
                } else {
                  return acc;
                }
              }, {});
              return await Promise.all(Object.keys(changeOthers).map(async (serviceName) => {
                return await Promise.all(changeOthers[serviceName].map(async (thing) => {
                  return await service(`wpb-${serviceName}`)._patch(thing._id, {
                    styles: {
                      ...thing.styles,
                      order: movingUp ? thing.styles.order - 1 : thing.styles.order + 1,
                    },
                  });
                }));
              }))
                .then((res) => {
                  console.log('\n\n\n\n\nfinished patching others', res, '\n\n\n\n\n');
                  return context;
                })
                .catch(err => console.error('error changing orders', err));
            }
          } else {
            throw new GeneralError('No parent info for reordering');
          }
        }
      }
    } else if (context.method === 'remove') {
      const self = await service(context.path).get(context.id, {disableSoftDelete: true});
      const selfOrder = lget(self, 'styles.order', undefined);
      if (lisNumber(selfOrder)) {
        let parentInfo;
        if (self.section) {
          parentInfo = {service: 'wpb-sections', id: self.section};
        } else if (self.parent) {
          parentInfo = {service: 'wpb-sections', id: self.parent};
        } else if (self.page) {
          parentInfo = {service: 'wpb-pages', id: self.page};
        }
        if (parentInfo) {
          const parent = await service(parentInfo.service).get(parentInfo.id);
          if (parent) {
            const changeMe = (pos) => {
              if (!lisNumber(pos)) return false;
              return pos > selfOrder;
            };
            const fastJoin = lget(parent, '_fastjoin', {});
            const changeOthers = Object.keys(fastJoin).reduce((acc, curr) => {
              if (Array.isArray(fastJoin[curr]) && ['sections', 'elements'].includes(curr)) {
                return {
                  ...acc, [curr]: fastJoin[curr].filter(item => {
                    let order = lget(item, 'styles.order');
                    return String(item._id) !== String(self._id) && changeMe(order);
                  }),
                };
              } else {
                return acc;
              }
            }, {});
            return await Promise.all(Object.keys(changeOthers).map(async (serviceName) => {
              return await Promise.all(changeOthers[serviceName].map(async (thing) => {
                return await service(`wpb-${serviceName}`)._patch(thing._id, {
                  styles: {
                    ...thing.styles, order: thing.styles.order - 1,
                  },
                });
              }));
            }))
              .then((res) => {
                console.log('\n\n\n\n\nfinished patching others', res, '\n\n\n\n\n');
                return context;
              })
              .catch(err => console.error('error changing orders', err));
          }
        } else {
          if (self.template || self.devTemplate || self.baseSection || self.baseElement) {
            return context;
          } else {
            throw new GeneralError('No parent info for reordering');
          }
        }
      } else {
        // TODO: I am hitting this error when trying to delete element after new creation of page.
        // throw new GeneralError('No self order for performing a reorder of others');
      }
    }
  };
};
