/**
 * testFloodsgauges module
 * @module test/testFloodsgauges
 * A module to test the /floodgauges endpoint
 */

import * as test from 'unit.js';

/**
 * Test floodgauges endpoint
 * @alias module:test/testFloodsgauges
 * @param {Object} app - CogniCity server app object
 */
export default function(app) {
  // Flood gauges endpoint
  describe('Flood gauges endpoint', function() {
    // Can get flood gauge data
    it('Return 200 for get /floodgauges', function(done) {
        test.httpAgent(app)
          .get('/floodgauges')
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

      // Catch invalid city in floodgauge
      it('Return 400 for get /floodgauges?city=xxx', function(done) {
          test.httpAgent(app)
            .get('/floodgauges?city=xxx')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              } else {
                done();
              }
           });
        });

      // Catch invalid floodgauge id
      it('Return 404 for get /floodgauges/:id', function(done) {
          test.httpAgent(app)
            .get('/floodgauges/0')
            .expect(404)
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
