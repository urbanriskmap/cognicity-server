/* eslint-disable no-console */
/**
 * testDB module
 * @module test/testDB
 * A module to test the db utility module
 */

import * as test from 'unit.js';  // Unit testing module
import initializeDb from '../db'; // Database utility

/**
 * Test db utility module
 * @alias module:test/testDB
 */
export default function() {
  describe('Test CogniCity Server Database Module', function() {
   it('Catches errors on startup', function(done) {
     // Try and connect to the db
     let config = {};
     let logger = {};
     logger.error = function(err) {
       console.log(err);
     };
     logger.debug = function(err) {
       console.log(err);
     };
     initializeDb(config, logger)
      .then((db) => {
        test.value(db).is(null);
        // done(); do nothing here, an error should be forced by empty config
      })
      .catch((err) => {
        console.log(err);
        done();
      });
   });
  });
}
