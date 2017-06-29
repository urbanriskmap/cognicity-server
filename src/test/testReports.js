/**
 * testReports module
 * @module test/testReports
 * A module to test the /reports endpoint
 */

import * as test from 'unit.js';

/**
 * Test reports endpoint
 * @alias module:test/testReports
 * @param {Object} app - CogniCity server app object
 * @param {Number} reportid - CogniCity report ID to test against
 */
export default function(app, reportid) {
  // Reports endpoint
  describe('Reports endpoint', function() {
    // Can get reports
    it('Get all reports (GET /reports)', function(done) {
        test.httpAgent(app)
          .get('/reports')
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

    // Can get reports as geojson
    it('Get all reports as geojson', function(done) {
        test.httpAgent(app)
          .get('/reports?format=json&geoformat=geojson')
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

    // Can get reports as geojson
    it('Get all reports as topojson', function(done) {
        test.httpAgent(app)
          .get('/reports?format=json&geoformat=topojson')
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

    // Can get reports by city
    it('Get reports by city /reports?city=jbd', function(done) {
        test.httpAgent(app)
          .get('/reports?city=jbd')
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

    // Catch report by city error
    it('Get reports by city /reports?city=xxx', function(done) {
        test.httpAgent(app)
          .get('/reports?city=xxx')
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

      // Can report by id
      it('Get reports/:id endpoint', function(done) {
          test.httpAgent(app)
            .get('/reports/'+reportid)
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
