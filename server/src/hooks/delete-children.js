// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const {packages: {lodash: {lget}}} = require('@iy4u/common-utils');
const {utils: {coreCall}} = require('@iy4u/common-server-lib');


// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    let item = context.id;
    let service = context.path;
    let document = await coreCall(context, service).get(item, {disableSoftDelete: true});
    const pages = lget(document, 'pages', []);
    const sections = lget(document, 'sections', []);
    const children = lget(document, 'children', []);
    const elements = lget(document, 'elements', []);
    const totalDependants =  sections.length + children.length + elements.length +  pages.length;
    // console.log(context.result);

    if (pages.length) {
      await Promise.all(pages.map(page => {
        return coreCall(context, 'wpb-pages').remove(page, {$dontUpdatePage: true});
      })).then(res => {
        console.log('page delete promise.all response', res);
        return res;
      }).catch(err => {
        console.error('page delete promise.all error', err);
        return err;
      });
    }

    if (sections.length) {
      await Promise.all(sections.map(section => {
        return coreCall(context, 'wpb-sections').remove(section, {$dontUpdatePage: true});
      })).then(res => {
        console.log('sections delete promise.all response', res);
        if (!pages.length) {
          context.app.service('progress').emit('created',{amount: (100 / totalDependants).toFixed(0), _id: '0'});
        }
        return res;
      }).catch(err => {
        console.error('promise.all error', err);
        return err;
      });
    }

    if (children.length) {
      await Promise.all(children.map(section => {
        return coreCall(context, 'wpb-sections').remove(section, {$dontUpdatePage: true});
      })).then(res => {
        console.log('children delete promise.all response', res);
        if (!sections.length) {
          context.app.service('progress').emit('created',{amount: (100 / totalDependants).toFixed(0), _id: '0'});
        }
        return res;
      }).catch(err => {
        console.error('promise.all error', err);
        return err;
      });
    }

    if (elements.length) {
      await Promise.all(elements.map(section => {
        return coreCall(context, 'wpb-elements').remove(section, {$dontUpdatePage: true});
      })).then(res => {
        console.log('elements delete promise.all response', res);
        if (!sections.length) {
          context.app.service('progress').emit('created',{amount: (100 / totalDependants).toFixed(0), _id: '0'});
        }
        return res;
      }).catch(err => {
        console.error('promise.all error', err);
        return err;
      });
    }
    return context;
  };
};
