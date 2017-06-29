/**
 * testCities module
 * @module test/testCities
 * A module to test the /cities endpoint
 */

import * as test from 'unit.js';

/**
 * Test cities endpoint
 * @function testCities
 * @param {Object} app - CogniCity server app object
 */
export default function(app) {
  // Cities endpoint
  describe('Cities endpoint', function() {
    // Can get cities
    it('Return 200 for cities list', function(done) {
        test.httpAgent(app)
          .get('/cities')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      });
  });
}
