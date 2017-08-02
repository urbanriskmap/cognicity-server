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
    let query = `SELECT u.username, u.network, u.subscribed, locations.* FROM
      ${config.TABLE_ALERT_USERS} u, (SELECT a.userkey, a.the_geom,
        array_to_json(array_agg(b.*)) as alert_log FROM
          ${config.TABLE_ALERT_LOCATIONS} a
          LEFT JOIN ${config.TABLE_ALERT_LOGS} b ON a.pkey = b.location_key
          GROUP BY a.pkey) as locations
        WHERE u.pkey = locations.userkey
        AND u.username = $1
        AND u.network = $2`;

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
