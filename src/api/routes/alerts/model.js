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

	// Return specific report by id
	byUser: (username, network) => new Promise((resolve, reject) => {
		// Setup query
    let query = `SELECT l.pkey, u.username, u.network, u.subscribed, l.the_geom
      FROM ${config.TABLE_ALERT_USERS} u,
      ${config.TABLE_ALERT_LOCATIONS} l,
      alerts.log log
      WHERE u.username = $1
      AND u.network = $2
      AND l.userkey = u.pkey`;

    let query = `SELECT l.pkey, l.the_geom,  array_to_json(array_agg(f)) as alerts_log FROM (SELECT log_time, log_metadata, location_key FROM alerts.log) f, alerts.locations l WHERE l.pkey = f.location_key GROUP BY l.pkey`

		// Setup values
		let values = [username, network];

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
});
