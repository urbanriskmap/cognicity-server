/**
 * CogniCity Server /infrastructure data model
 * @module src/api/infrastructure/model
 **/
import Promise from 'bluebird';

/**
* Methods to get infrastructure layers from database
 * @alias module:src/api/infrastructure/model
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} Query methods
 */
export default (config, db, logger) => ({
	// A list of all infrastructure matching a given type
	all: (city, type) => new Promise((resolve, reject) => {
		// Setup query
		let query = `SELECT name, the_geom
			FROM infrastructure.${type}
			WHERE ($1 IS NULL OR tags->>'instance_region_code'=$1)`;

		// Setup values
		let values = [city];

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
