/**
 * CogniCity Server /reports/archive data model
 * @module src/api/reports/archive/model
 **/
import Promise from 'bluebird';

/**
 * Interact with historic report objects
 * @alias module:src/api/reports/archive/model
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} Query methods
 */
export default (config, db, logger) => ({
	rangeQuery: (start, end, preparedSQL, city) => new Promise((resolve, reject) => {
		// Setup query
		let query = `SELECT pkey, created_at, source,
			status, url, image_url, disaster_type, report_data, tags, title, text,
			the_geom FROM ${config.TABLE_REPORTS}
			WHERE created_at >= $1::timestamp with time zone
      AND created_at <= $2::timestamp with time zone
			AND ($3 IS NULL OR tags->>'instance_region_code'=$3)
      ${preparedSQL} 
			ORDER BY created_at DESC LIMIT $4`;

		// var timeWindow = (Date.now() / 1000) - timeperiod;

		let values = [start, end, city, config.API_REPORTS_LIMIT];

		// Execute
		logger.debug(query, values);
		db.any(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	}),
});
