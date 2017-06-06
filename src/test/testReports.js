// Testing for CogniCity Server
// Unit tests run together against live app, and database

// Import Unit.js
const test = require('unit.js');

// Import config
import config from '../config';

// Import DB initializer
import initializeDb from '../db';

// Import the routes
import routes from '../api';

// Import server object
import { init } from '../server.js';

// Mock logger object for app
const winston = require('winston');
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ raw: true }),
  ]
});

// Create a top-level testing harness
describe('Cognicity Server Testing Harness', function() {

 it('Server starts', function(done){
  init(config, initializeDb, routes, logger).then((app) => {

    describe('Reports endpoint', function() {

      // Can get reports
      it('Get all reports (GET /reports)', function(done){
          test.httpAgent(app)
            .get('/reports')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res){
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              }
              else {
                done();
              }
           });
        });

      // Can get reports by city
      it('Get reports by city /reports?city=jbd', function(done){
          test.httpAgent(app)
            .get('/reports?city=jbd')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res){
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              }
              else {
                done();
              }
           });
        });

        // Catch report by city error
        it('Get reports by city /reports?city=xxx', function(done){
            test.httpAgent(app)
              .get('/reports?city=xxx')
              .expect(400)
              .expect('Content-Type', /json/)
              .end(function(err, res){
                if (err) {
                  test.fail(err.message + ' ' + JSON.stringify(res));
                }
                else {
                  done();
                }
             });
          });
     });
   return (done())
   });
  });
});
