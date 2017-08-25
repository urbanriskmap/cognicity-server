/**
 * CogniCity Server /reports data model
 * @module src/api/reports/model
 **/
 import Promise from 'bluebird';

/**
 * Methods to get current flood reports from database
 * @alias module:src/api/reports/model
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} Query methods
 */
export default (config, db, logger) => ({
  all: (timeperiod, city) => new Promise((resolve, reject) => {
    // Setup query
    let query = `SELECT pkey, created_at, source,
      status, url, image_url, disaster_type, report_data, tags, title, text,
      the_geom FROM ${config.TABLE_REPORTS}
      WHERE created_at >= to_timestamp($1)
      AND ($2 IS NULL OR tags->>'instance_region_code'=$2)
      ORDER BY created_at DESC LIMIT $3`;

    let timeWindow = (Date.now() / 1000) - timeperiod;

    let values = [timeWindow, city, config.API_REPORTS_LIMIT];

    // Execute
    logger.debug(query, values);
    db.any(query, values).timeout(config.PGTIMEOUT)
      .then((data) => resolve(data))
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),

  // Return specific report by id
  byId: (id) => new Promise((resolve, reject) => {
    // Setup query
    let query = `SELECT pkey, created_at, source,
      status, url, image_url, disaster_type, report_data, tags, title, text,
      the_geom FROM ${config.TABLE_REPORTS}
      WHERE pkey = $1`;

    // Setup values
    let values = [id];

    // Execute
    logger.debug(query, values);
    db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
      .then((data) => resolve(data))
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),
});
