const request = require('supertest');
const assert = require('chai').assert;
require('it-each')();

import { init } from '../../..';

// Setup an array of tests to run
// TODO: Add POST test
const tests = [
  {
    url: '/feeds/qlue',
    exp: {
      status: 200
    }
  }
]

// Run the tests
describe('GET /feeds', () => {
  it.each(tests, 'respond with correct response for test', (test, next) => {
    init().then((app) => {
      request(app)
        .get(test.url)
        .end((err, res) => {
          if (err) next(err);
          assert.equal(res.status, test.exp.status);
          return next();
        });
    });
  });
});
