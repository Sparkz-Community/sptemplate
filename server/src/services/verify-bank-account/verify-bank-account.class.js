/* eslint-disable no-unused-vars */
const {lodash: {lget}} = require('@iy4u/common-utils').packages;
exports.VerifyBankAccount = class VerifyBankAccount {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  async find(params) {
    // await this.options.tallyBank.start();
    return [];
  }

  async get(id, params) {
    return {
      id, text: `A new message with ID: ${id}!`,
    };
  }

  async create(data, params) {
    await this.options.tallyBank.start();
    const {plaid} = this.options.tallyBank;
    const {_id, email} = params.user;
    return plaid.create({userId: `byld_${_id}`, username: 'Byld Capital', ...data});
  }

  async update(id, data, params) {
    return data;
  }

  async patch(id, data, params) {
    await this.options.tallyBank.start();
    return this.options.tallyBank.accounts.create(data);
  }

  async remove(id, params) {
    return {id};
  }
};
