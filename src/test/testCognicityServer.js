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

// need to put in dummy data to database.

// Create a top-level testing harness
describe('Cognicity Server Testing Harness', function() {

 it('Server starts', function(done){

   // Test optional server params
  config.COMPRESS = true;
  config.CORS = true;
  config.RESPONSE_TIME = true;

  // Initialise
  init(config, initializeDb, routes, logger).then((app) => {

    describe('Top level API endpoint', function(){
      it('Gets current API version', function(done){
        test.httpAgent(app)
          .get('/')
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

      it('Can handle unknown routes', function(done){
        test.httpAgent(app)
          .get('/moon')
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

        // Can get reports
        it('Has a get all reports/:id endpoint (GET /reports/:id)', function(done){
            test.httpAgent(app)
              .get('/reports/1')
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

    // Floods endpoint
    describe('Flood areas endpoint', function(){

      // Test put flood auth
      it ('Catch bad auth for put a flood (PUT /floods/:id)', function(done){
        test.httpAgent(app)
          .put('/floods/5')
          .send({
              "state": "2"
          })
          .expect(401)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err){
              test.fail(err.message + ' ' + JSON.stringify(res));
            }
            else {
              done();
            }
          });
      });

      // Test delete flood auth
      it ('Catch bad auth for put a flood (PUT /floods/:id)', function(done){
        test.httpAgent(app)
          .delete('/floods/5')
          .send({
              "username": "testing"
          })
          .expect(401)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err){
              test.fail(err.message + ' ' + JSON.stringify(res));
            }
            else {
              done();
            }
          });
      });

      // Put a flood
      /*it ('Put a flood (PUT /floods/:id)', function(done){
        let auth = { headers: { 'Authorization': 'Bearer ' + config.AUTH0_SECRET } }
        test.httpAgent(app)
          .put('/floods/5')
          .set(auth)
          .send({
              "state": "2"
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err){
              test.fail(err.message + ' ' + JSON.stringify(res));
            }
            else {
              done();
            }
          });
      });*/

      // Get floods
      it('Get floods (GET /floods)', function(done){
          test.httpAgent(app)
            .get('/floods')
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

      // Can get reports in CAP format
      /*it('Get all reports in CAP format (GET /floods?geoformat=cap)', function(done){
          test.httpAgent(app)
            .get('/floods?format=xml&geoformat=cap')
            .expect(200)
            .expect('Content-Type', /text/)
            .end(function(err, res){
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              }
              else {
                done();
              }
           });
        });*/
    });

    // Cards end to end test
    describe('End-to-end card test', function() {

      let cardId = '0';

      // Request a card, submit and get resulting card detailsß
      it('Get card one time link', function(done){
          test.httpAgent(app)
            .post('/cards')
            .send({
                "username": "testuser",
                "network": "twitter",
                "language": "en"
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res){
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              }
              else {
                cardId = res.body.cardId
                test.value(res.body.created).is(true);
                done();
              }
           });
        });

        // Request a card, submit and get resulting report
        it('Put card data', function(done){
            test.httpAgent(app)
              .put('/cards/'+cardId)
              .send({
                  "water_depth": 20,
                  "text": "big flood",
                  "created_at": "2017-02-21T07:00:00+0700",
                  "location": {
                    "lat": -6.4,
                    "lng": 106.6
                  }
              })
              .expect(200)
              .expect('Content-Type', /json/)
              .end(function(err, res){
                if (err) {
                  test.fail(err.message + ' ' + JSON.stringify(res));
                }
                else {
                  console.log(res.body);
                  done();
                }
             });
          });

          // Request a card, submit and get resulting report
          it('Put card data', function(done){
              test.httpAgent(app)
                .get('/cards/'+cardId)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res){
                  if (err) {
                    test.fail(err.message + ' ' + JSON.stringify(res));
                  }
                  else {
                    test.value(res.body.result.card_id).is(cardId);
                    test.value(res.body.result.username).is('testuser');
                    test.value(res.body.result.network).is('twitter')
                    test.value(res.body.result.language).is('en')
                    test.value(res.body.result.report.text).is('big flood')
                    done();
                  }
               });
            });

            // Update a card
            it('Update card data', function(done){
                test.httpAgent(app)
                  .patch('/cards/'+cardId)
                  .send({
                      "water_depth": 20,
                      "text": "big flood",
                      "image_url": "dummy image url"
                  })
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
