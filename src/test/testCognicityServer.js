/*/reports/0*/

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

    // Reports endpoint
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

     // Cards endpoint
     describe('Cards endpoint', function() {
       // Cards
       it('Return 404 if card requested without ID (GET /cards)', function(done){
           test.httpAgent(app)
             .get('/cards')
             .expect(404)
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

       // Can get reports
       it('Return 400 if card requested with wrong ID (GET /cards/:id)', function(done){
           test.httpAgent(app)
             .get('/cards/1')
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

    // Cities endpoint
    describe('Cities endpoint', function() {
      // Can get cities
      it('Return 200 for cities list', function(done){
          test.httpAgent(app)
            .get('/cities')
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
    });

    // Feeds endpoint
    describe('Feeds endpoint', function() {
      // Can get cities
      it('Return 400 for post to feeds/qlue', function(done){
          test.httpAgent(app)
            .post('/feeds/qlue')
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

    // Flood gauges endpoint
    describe('Flood gauges endpoint', function() {
      // Can get flood gauge data
      it('Return 200 for get /floodgauges', function(done){
          test.httpAgent(app)
            .get('/floodgauges')
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

        // Catch invalid city in floodgauge
        it('Return 400 for get /floodgauges?city=xxx', function(done){
            test.httpAgent(app)
              .get('/floodgauges?city=xxx')
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

        // Catch invalid floodgauge id
        it('Return 404 for get /floodgauges/:id', function(done){
            test.httpAgent(app)
              .get('/floodgauges/0')
              .expect(404)
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

    // Infrastructure endpoint
    describe('Infrastructure endpoint', function() {
      // Catch invalid top-level infrastructure endpoint
      it('Return 404 for get /infrastructure', function(done){
          test.httpAgent(app)
            .get('/infrastructure')
            .expect(404)
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

        // Return waterways infrastructure
        it('Return 200 for get /infrastructure/waterways', function(done){
            test.httpAgent(app)
              .get('/infrastructure/waterways')
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
    });

   return (done())
   });
  });
});
