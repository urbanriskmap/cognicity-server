/**
 * CogniCity Server /cities data model
 * @module src/api/cities/model
 **/
import Promise from 'bluebird';

/**
* Methods to get cities data from database
 * @alias module:src/api/cities/model
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} Query methods
 */
export default (config, db, logger) => ({
	// A list of all infrastructure matching a given type
	all: () => new Promise((resolve, reject) => {
		// Setup query
		let query = `SELECT code, name, the_geom
			FROM cognicity.instance_regions`;

		// Execute
		logger.debug(query);
		db.any(query).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	}),

});
