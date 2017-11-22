/* eslint-disable max-len */
/**
 * testFloodsArchive module
 * @module test/testFloodsTimeseries
 * A module to test the /floods/timeseries endpoint
 */

import * as test from 'unit.js';

// TODO
// - test against an actual time in the database
// - Entered through cards.js (or add a new call to cards here)

/**
 * Test floods timeseries endpoint
 * @function testFloodsTimeseries
 * @param {Object} app - CogniCity server app object
 */
export default function(app) {
  // Floods endpoint
  describe('Floods Archive Endpoint', function() {
    // Can get floods between given timestamps
    it('Can get floods timeseries given timestamps', function(done) {
        test.httpAgent(app)
          .get('/floods/timeseries?start=2017-06-07T00:00:00%2B0700&end=2017-06-08T23:00:00%2B0700')
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
          .get('/floods/timeseries?end=2017-02-22T07:00:00%2B0700')
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
          .get('/floods/timeseries?start=2017-02-22T07:00:00%2B0700')
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
            .get('/floods/timeseries?start=2017-02-21T07:00:00%2B0700&end=2017-02-20T07:00:00')
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
              .get('/floods/timeseries?start=2017-02-21T07:00:00')
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
              .get('/floods/timeseries?start=2017-02-21')
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
