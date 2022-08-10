const assert = require('assert');
const app = require('../../src/app');

describe('\'funnel-responses\' service', () => {
  it('registered the service', () => {
    const service = app.service('funnel-responses');

    assert.ok(service, 'Registered the service');
  });
});
