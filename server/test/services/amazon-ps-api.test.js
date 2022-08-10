const assert = require('assert');
const app = require('../../src/app');

describe('\'amazon-ps-api\' service', () => {
  it('registered the service', () => {
    const service = app.service('amazon-ps-api');

    assert.ok(service, 'Registered the service');
  });
});
