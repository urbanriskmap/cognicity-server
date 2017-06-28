// Testing for CogniCity Server
// Unit tests run together against live app, and database

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
    new (winston.transports.Console)({ raw: true, level: 'debug' }),
  ]
});


// Import tests
import testServer from './testServer.js';
import testCards from './testCards.js';
import testCities from './testCities.js';
import testFeeds from './testFeeds.js';
import testFloodgauges from './testFloodgauges.js';
import testInfrastructure from './testInfrastructure.js';
import testFloods from './testFloods.js';
import testReports from './testReports.js';
import testReportsArchive from './testReportsArchive';
import testCAP from './testCAP.js';
import testDB from './testDB.js';

// Put some sample data in the database
const pg = require('pg');

// Create a top-level testing harness
describe('Cognicity Server Testing Harness', function() {

// PG config string for dummy data inserts
let PG_CONFIG_STRING = 'postgres://'+config.PGUSER+'@'+config.PGHOST+':'+config.PGPORT+'/'+config.PGDATABASE;

// Global report value
let reportid = 1;

// Auth JWT support
const jwt = require('jsonwebtoken');
let token = jwt.sign({},new Buffer(config.AUTH0_SECRET),{audience: config.AUTH0_CLIENT_ID});

 it('Server starts', function(done){
   // Test optional server params
  config.COMPRESS = true;
  config.CORS = true;
  config.RESPONSE_TIME = true;

  // Initialise
  init(config, initializeDb, routes, logger).then((app) => {

    testServer(app);
    testCards(app);
    testCities(app);
    testFeeds(app);
    testFloodgauges(app);
    testInfrastructure(app);
    testFloods(app, token);
    testReports(app, reportid);
    testReportsArchive(app);
    testCAP(logger);
    testDB();

    // Removes dummy data
    describe('Cleans up', function() {
       it ('Removes dummy report data', function(done){
         let queryObject = {
           text: `DELETE FROM ${config.TABLE_REPORTS} WHERE source = 'grasp' AND text = 'integration testing';`,
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

       it ('Removes dummy cards data', function(done){
         let queryObject = {
           text: `DELETE FROM ${config.TABLE_GRASP_CARDS} WHERE username = 'testuser' AND network = 'test network';`,
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

       it ('Removes dummy cards data', function(done){
         let queryObject = {
           text: `DELETE FROM ${config.TABLE_GRASP_REPORTS} WHERE text = 'integration testing';`,
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

     // Remove dummy data from REM floods table
     it ('Removes dummy flood data', function(done){
      let queryObject = {
         text: `DELETE FROM ${config.TABLE_REM_STATUS} WHERE local_area = 5`,
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

     // Remove dummy data from REM floods table
     it ('Removes dummy flood data from log', function(done){
      let queryObject = {
         text: `DELETE FROM ${config.TABLE_REM_STATUS_LOG} WHERE username = testing`,
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
