/* eslint-disable no-unused-vars */
const {cssToJss, jssToCss} = require('jss-cli');

exports.WpbJssConversion = class WpbJssConversion {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    return [];
  }

  async get(id, params) {
    return {
      id, text: `A new message with ID: ${id}!`,
    };
  }

  async create(data, params) {

    const prepend = val => {
      if(typeof val === 'string') {
        return `#editor-${data.prepend} ${val}`;
      } else if (typeof val === 'object') {
        return Object.keys(val).reduce((acc, curr) => {
          if (!curr.includes('@media') && !curr.includes('@keyframes')) {
            acc[prepend(curr)] = val[curr];
          } else if (curr.includes('@media')) {
            acc[curr] = prepend(val[curr]);
          } else {
            acc[curr] = val[curr];
          }
          return acc;
        },{});
      }
    };

    switch (data.action) {
      case 'toCss': {
        return jssToCss({styles: data.value});
      }
      case 'toJss': {
        return cssToJss({code: data.value});
      }
      case 'prependCss': {
        let jss = cssToJss({code: data.value});
        jss['@global'] = prepend(jss['@global']);
        return jssToCss({styles: jss});
      }

      default: return Error('something went wrong');
    }

  }

  async update(id, data, params) {
    return data;
  }

  async patch(id, data, params) {
    return data;
  }

  async remove(id, params) {
    return {id};
  }
};
