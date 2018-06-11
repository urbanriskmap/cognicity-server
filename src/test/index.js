/* eslint-disable no-console */
/**
 * Integration testing for CogniCity Server API
 * @file Runs unit tests in sequence against live app and database instance
 *
 * Tomas Holderness June 2017
 */

// Import config
import config from '../config';

// Import DB initializer
import initializeDb from '../db';

// Import the routes
import routes from '../api';

// Import server object
import {init} from '../server.js';

// Mock logger object for app
const winston = require('winston');
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({raw: true, level: 'debug'}),
  ],
});


// Import tests
import testServer from './testServer.js';
import testCards from './testCards.js';
import testCities from './testCities.js';
import testFeeds from './testFeeds.js';
import testFloodgauges from './testFloodgauges.js';
import testInfrastructure from './testInfrastructure.js';
import testFloods from './testFloods.js';
import testFloodsArchive from './testFloodsArchive';
import testFloodsTimeseries from './testFloodsTimeseries';
import testReports from './testReports.js';
import testReportsArchive from './testReportsArchive';
import testReportsTimeseries from './testReportsTimeseries';
import testCAP from './testCAP.js';
import testDB from './testDB.js';

// Put some sample data in the database
import Promise from 'bluebird';
const pgp = require('pg-promise')({
  promiseLib: Promise, // Use bluebird for enhanced promises
});

// Create a top-level testing harness
describe('Cognicity Server Testing Harness', function() {
// PG config string for dummy data inserts
const PG_CONFIG_STRING = 'postgres://'+config.PGUSER+'@'+config.PGHOST+':'+config.PGPORT+'/'+config.PGDATABASE;

// Global report value
let reportid = '1';
let createdAt = new Date().toISOString();

// Auth JWT support
const jwt = require('jsonwebtoken');
let token = jwt.sign({},
  new Buffer(config.AUTH0_SECRET),
  {audience: config.AUTH0_CLIENT_ID});

 it('Server starts', function(done) {
   // Test optional server params
  config.COMPRESS = true;
  config.CORS = true;
  config.RESPONSE_TIME = true;

      // Initialise
      init(config, initializeDb, routes, logger).then((app) => {
        testServer(app);
        testCards(app, createdAt);
        testCities(app);
        testFeeds(app);
        testFloodgauges(app);
        testInfrastructure(app);
        testFloods(app, token);
        testFloodsArchive(app);
        testFloodsTimeseries(app);
        testReports(app, reportid, createdAt);
        testReportsArchive(app);
        testReportsTimeseries(app);
        testCAP(config, logger);
        testDB();

        // Removes dummy data
        describe('Cleans up', function() {
        let db = pgp(PG_CONFIG_STRING);
        it('Removes dummy report data', function(done) {
        let query = `DELETE FROM ${config.TABLE_REPORTS}
              WHERE source = 'grasp'
              AND text = 'integration testing';`;

          db.none(query)
            .then(() => {
              done();
            })
            .catch((error) => console.log(error));
        });

        it('Removes dummy cards data', function(done) {
          let query = `DELETE FROM ${config.TABLE_GRASP_CARDS}
              WHERE username = 'testuser'
              AND network = 'test network';`;

            db.none(query)
              .then(() => {
                done();
              })
              .catch((error) => console.log(error));
        });

        it('Removes dummy cards data', function(done) {
          let query = `DELETE FROM ${config.TABLE_GRASP_REPORTS}
              WHERE text = 'integration testing';`;

          db.none(query)
            .then(() => {
              done();
            })
            .catch((error) => console.log(error));
        });

        // Remove dummy data from REM floods table
        it('Removes dummy flood data', function(done) {
          let query = `DELETE FROM ${config.TABLE_REM_STATUS} 
            WHERE local_area = 5`;

          db.none(query)
            .then(() => {
              done();
            })
            .catch((error) => console.log(error));
        });

        // Remove dummy data from REM floods table
        it('Removes dummy flood data from log', function(done) {
          let query = `DELETE FROM ${config.TABLE_REM_STATUS_LOG}
                        WHERE username = 'testing'`;
            db.none(query)
              .then(() => {
                done();
              })
              .catch((error) => console.log(error));
          });


        // Remove dummy data from qlue table
        it('Removes dummy qlue data', function(done) {
          let query =`DELETE FROM ${config.TABLE_FEEDS_QLUE} WHERE pkey = 9999`;
          db.none(query)
            .then(() => {
              done();
            })
            .catch((error) => console.log(error));
        });

        // Remove dummy qlue data from all reports table
        it('Removes dummy qlue data', function(done) {
          let query = `DELETE FROM ${config.TABLE_REPORTS}
              WHERE fkey = 9999 AND source = 'qlue'`;
          db.none(query)
            .then(() => {
              done();
            })
            .catch((error) => console.log(error));
        });

        // Remove dummy data from detik table
        it('Removes dummy detik data', function(done) {
          let query = `DELETE FROM ${config.TABLE_FEEDS_DETIK} 
            WHERE pkey = 9999`;
          db.none(query)
            .then(() => {
              done();
            })
            .catch((error) => console.log(error));
          });

        // Remove dummy detik data from all reports table
        it('Removes dummy detik data', function(done) {
          let query = `DELETE FROM ${config.TABLE_REPORTS}
              WHERE fkey = 9999 AND source = 'detik'`;
          db.none(query)
            .then(() => {
              done();
            })
            .catch((error) => console.log(error));
        });
        return (done());
      });
    });
  });
});
