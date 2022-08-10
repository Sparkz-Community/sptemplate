// eslint-disable-next-line no-unused-vars
// const { inspect } = require('util');
const {packages: {lodash: {ltransform, lisEqual, lisPlainObject}}} = require('@iy4u/common-utils');

/**
 * Find difference between two objects
 * @param  {object} origObj - Source object to compare newObj against
 * @param  {object} newObj  - New object with potential changes
 * @return {object} differences
 */
module.exports = function (origObj, newObj) {
  function changes(newObj, origObj) {
    let arrayIndexCounter = 0;
    return ltransform(newObj, function (result, value, key) {
      if (!lisEqual(value, origObj[key])) {
        let resultKey = Array.isArray(origObj) ? arrayIndexCounter++ : key;
        result[resultKey] = (lisPlainObject(value) && lisPlainObject(origObj[key])) ? changes(value, origObj[key]) : value;
      }
    });
  }
  return changes(newObj, origObj);
};
