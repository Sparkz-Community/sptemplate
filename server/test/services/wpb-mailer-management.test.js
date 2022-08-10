const assert = require('assert');
const app = require('../../src/app');

describe('\'wpb-mailer-management\' service', () => {
  it('registered the service', () => {
    const service = app.service('wpb-mailer-management');

    assert.ok(service, 'Registered the service');
  });
});
