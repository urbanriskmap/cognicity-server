/* eslint-disable max-len */
/**
 * testReportsArchive module
 * @module test/testFloodsArchive
 * A module to test the /reports/archive endpoint
 */

import * as test from 'unit.js';

// TODO
// - test against an actual time in the database
// - Entered through cards.js (or add a new call to cards here)

/**
 * Test reports archive endpoint
 * @function testFloodsArchive
 * @param {Object} app - CogniCity server app object
 * @param {String} createdAt - Sample ISO 8601 timestamp of report to test
 */
export default function(app) {
  // Reports endpoint
  describe('Reports Archive Endpoint', function() {
    // Can get reports between given timestamps
    it('Can get floods between given timestamps', function(done) {
        test.httpAgent(app)
          .get('/floods/archive?start=2017-06-07T00:00:00%2B0700&end=2017-06-08T23:00:00%2B0700')
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

    // Can catch no start parameter
    it('Required start parameter by default', function(done) {
        test.httpAgent(app)
          .get('/reports/archive?end=2017-02-22T07:00:00%2B0700')
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

    // Can catch no end parameter
    it('Required end parameter by default', function(done) {
        test.httpAgent(app)
          .get('/reports/archive?start=2017-02-22T07:00:00%2B0700')
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

      // Catch end time before start time
      it('Required end time to be after start time', function(done) {
          test.httpAgent(app)
            .get('/reports/archive?start=2017-02-21T07:00:00%2B0700&end=2017-02-20T07:00:00')
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

        // Can catch no UTC offset in start parameter
        it('Required start parameter to have a UTC offset', function(done) {
            test.httpAgent(app)
              .get('/reports/archive?start=2017-02-21T07:00:00')
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

        // Can catch no UTC offset in start parameter
        it('Catches badly formed time stamp', function(done) {
            test.httpAgent(app)
              .get('/reports/archive?start=2017-02-21')
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
   });
}
