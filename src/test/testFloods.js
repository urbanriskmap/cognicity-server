/**
 * testFloods module
 * @module test/testFloods
 * A module to test the /floods endpoint
 */

import * as test from 'unit.js';

/**
 * Test infrastructure endpoint
 * @alias module:test/testFloods
 * @param {Object} app - CogniCity server app object
 * @param {Object} jwt - Sample JSON Web Token for testing endpoint auth
 */
export default function(app, jwt) {
// Floods endpoint
describe('Flood areas endpoint', function() {
    // Test put flood auth
    it('Catch bad auth for put a flood (PUT /floods/:id)', function(done) {
      test.httpAgent(app)
        .put('/floods/5')
        .send({
            'state': '2',
        })
        .expect(401)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            test.fail(err.message + ' ' + JSON.stringify(res));
          } else {
            done();
          }
        });
    });

    // Test delete flood auth
    it('Catch bad auth for delete a flood (PUT /floods/:id)', function(done) {
      test.httpAgent(app)
        .delete('/floods/5')
        .send({
            'username': 'testing',
        })
        .expect(401)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            test.fail(err.message + ' ' + JSON.stringify(res));
          } else {
            done();
          }
        });
    });

    // Test put flood auth
    it('Put a flood  with auth(PUT /floods/:id)', function(done) {
      test.httpAgent(app)
        .put('/floods/5?username=testing')
        .set({'Authorization': 'Bearer ' + jwt})
        .send({
            'state': '2',
        })
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

    // Test delete flood auth
    it('Delete a flood (PUT /floods/:id)', function(done) {
      test.httpAgent(app)
        .delete('/floods/5?username=testing')
        .set({'Authorization': 'Bearer ' + jwt})
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

    // Get floods
    it('Get floods (GET /floods)', (done) => {
        test.httpAgent(app)
          .get('/floods')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      }).timeout(15000); // a lot of data is returned

      // Get floods
      it('Get severe floods (GET /floods?minimum_state=3)', function(done) {
          test.httpAgent(app)
            .get('/floods?minimum_state=3')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              } else {
                done();
              }
           });
        }).timeout(15000); // a lot of data is returned


      // Just get flood states
      it('Get flood states without geo (GET /floods/states)', function(done) {
          test.httpAgent(app)
            .get('/floods/states')
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

      // Get geographic floods
      it('Get floods in geojson format', (done) => {
          test.httpAgent(app)
            .get('/floods/?format=json&geoformat=geojson')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              } else {
                done();
              }
           });
        }).timeout(15000); // a lot of data is returned

    // Can get reports in CAP format
    it('Get all reports in CAP format', (done) => {
        test.httpAgent(app)
          .get('/floods?format=xml&geoformat=cap')
          .expect(200)
          .expect('Content-Type', /text/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      }).timeout(15000); // a lot of data is returned;
    });
}
