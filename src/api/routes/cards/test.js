const request = require('supertest');
const assert = require('chai').assert;
require('it-each')();

import { init } from '../../..';

// Setup an array of tests to run
const tests = [
  {
    url: '/cards',
    exp: {
      status: 404
    }
  },
  {
    url: '/cards/1',
    exp: {
      status: 200
    }
  }
]

// Run the tests
describe('GET /cards', () => {
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
