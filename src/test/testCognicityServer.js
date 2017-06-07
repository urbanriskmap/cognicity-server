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

// Put some sample data in the database
const pg = require('pg');

// need to put in dummy data to database?

// Create a top-level testing harness
describe('Cognicity Server Testing Harness', function() {

 // Test pg config
 let reportid = 0;
 let PG_CONFIG_STRING = 'postgres://'+config.PGUSER+'@'+config.PGHOST+':'+config.PGPORT+'/'+config.PGDATABASE;

// Insert some dummy data
 before ('Insert dummy data', function(done){
   let queryObject = {
     text: `INSERT INTO ${config.TABLE_REPORTS} (fkey, created_at, text, source, status, disaster_type, lang, url, image_url, title, the_geom) VALUES (1, now(), 'test report', 'testing', 'confirmed', 'flood', 'en', 'no_url', 'no_url', 'no_title', ST_GeomFromText('POINT(106.816667 -6.2)', 4326)) RETURNING pkey`
    };

   pg.connect(PG_CONFIG_STRING, function(err, client, pgDone){
     client.query(queryObject, function(err, result){
       reportid = result.rows[0].pkey;
       pgDone();
     });
    });
   pg.connect(PG_CONFIG_STRING, function(err, client, pgDone){
     client.query(`INSERT INTO ${config.TABLE_REM_STATUS} (local_area, state, last_updated) VALUES (1, 1, now())`, function(err){
       if (err){
         console.log(err);
       }
       else {
         done();
         pgDone();
       }
     });
   });
 });

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
      // Can post to qlue
      it('Return 200 for post to feeds/qlue', function(done){
          test.httpAgent(app)
            .post('/feeds/qlue')
            .send({
                "post_id": "9999",
                "created_at": "2017-06-07T14:32+0700",
                "qlue_city": "surabaya",
                "disaster_type": "flood",
                "text": "test report",
                "location":{
                  "lat":45,
                  "lng":45
                }
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
      // Can post to detik
      it('Return 200 for post to feeds/detik', function(done){
          test.httpAgent(app)
            .post('/feeds/detik')
            .send({
                "contribution_id": "9999",
                "created_at": "2017-06-07T14:32+0700",
                "disaster_type": "flood",
                "location":{
                  "latitude":45,
                  "longitude":45
                },
                "text":"test report"
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

      // Get floods
      it('Get floods (GET /floods)', function(done){
        this.timeout(15000); // a lot of data is returned
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

        // Get floods
        it('Get floods in geojson (GET /floods?format=json&geoformat=geojson)', function(done){
          this.timeout(15000); // a lot of data is returned
            test.httpAgent(app)
              .get('/floods/?format=json&geoformat=geojson')
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
      it('Get all reports in CAP format (GET /floods?geoformat=cap)', function(done){
        this.timeout(15000); // a lot of data is returned
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
        });
    });

    // Cards end to end test
    describe('End-to-end card test', function() {

      let cardId = '0';

      // Request a card, submit and get resulting card details
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
                  "disaster_type":"flood",
                  "card_data":{
                    "flood_depth": 20,
                    "report_type": "flood"
                  },
                  "text": "big flood",
                  "created_at": "2017-06-07T07:00:00+0700",
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
              .get('/reports/'+reportid)
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

    // Removes dummy data
    describe('Cleans up', function() {
       it ('Removes dummy report data', function(done){
         let queryObject = {
           text: `DELETE FROM ${config.TABLE_REPORTS} WHERE pkey = $1;`,
           values: [ reportid ]
         };
         pg.connect(PG_CONFIG_STRING, function(err, client, pgDone){
           client.query(queryObject, function(){
             if (err) {
               console.log(err.message)
               pgDone();
             }
             else {
               pgDone();
               done();
             }
           });
         });
       });

     // Remove dummy data from reports table
     it ('Removes dummy flood data', function(done){
      let queryObject = {
         text: `DELETE FROM ${config.TABLE_REM_STATUS} WHERE local_area = 1`,
       };
       pg.connect(PG_CONFIG_STRING, function(err, client, pgDone){
         client.query(queryObject, function(){
           if (err) {
             console.log(err.message)
             pgDone();
           }
           else {
             pgDone();
             done();
           }
         });
       });
     });

     // Remove dummy data from qlue table
     it ('Removes dummy qlue data', function(done){
      let queryObject = {
         text: `DELETE FROM ${config.TABLE_FEEDS_QLUE} WHERE pkey = 9999`,
       };
       pg.connect(PG_CONFIG_STRING, function(err, client, pgDone){
         client.query(queryObject, function(){
           if (err) {
             console.log(err.message)
             pgDone();
           }
           else {
             pgDone();
             done();
           }
         });
       });
     });

     // Remove dummy qlue data from all reports table
     it ('Removes dummy qlue data', function(done){
      let queryObject = {
         text: `DELETE FROM ${config.TABLE_REPORTS} WHERE fkey = 9999 AND source = 'qlue'`,
       };
       pg.connect(PG_CONFIG_STRING, function(err, client, pgDone){
         client.query(queryObject, function(){
           if (err) {
             console.log(err.message)
             pgDone();
           }
           else {
             pgDone();
             done();
           }
         });
       });
     });

     // Remove dummy data from detik table
     it ('Removes dummy detik data', function(done){
      let queryObject = {
         text: `DELETE FROM ${config.TABLE_FEEDS_DETIK} WHERE pkey = 9999`,
       };
       pg.connect(PG_CONFIG_STRING, function(err, client, pgDone){
         client.query(queryObject, function(){
           if (err) {
             console.log(err.message)
             pgDone();
           }
           else {
             pgDone();
             done();
           }
         });
       });
     });

     // Remove dummy detik data from all reports table
     it ('Removes dummy detik data', function(done){
      let queryObject = {
         text: `DELETE FROM ${config.TABLE_REPORTS} WHERE fkey = 9999 AND source = 'detik'`,
       };
       pg.connect(PG_CONFIG_STRING, function(err, client, pgDone){
         client.query(queryObject, function(){
           if (err) {
             console.log(err.message)
             pgDone();
           }
           else {
             pgDone();
             done();
           }
         });
       });
     });
     return (done())
   });
   });
  });
});
