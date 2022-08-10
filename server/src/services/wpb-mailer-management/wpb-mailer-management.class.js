/* eslint-disable no-unused-vars */
exports.WpbMailerManagement = class WpbMailerManagement {
  constructor (options, app) {
    this.options = options || {};
    this.app = app;
  }

  async find (params) {
    return [];
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async sendEmail(email) {
    return this.app.service('mailer').create({email}, {headers: {'x-api-key': 'KEY HERE'}})
      .then(function (result) {
        console.log('Sent email', result);
        return result;
      })
      .catch(err => {
        console.log('Error sending email', err);
        return err;
      });
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    let res;
    switch (data.action) {
      case 'emailTemplateForm': {
        console.log('its hitting the backend with the data', data);
        let email_res = await this.sendEmail(data.value);
        console.log(email_res);
        res = email_res;
        break;
      }
    }
    return res;
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }
};
