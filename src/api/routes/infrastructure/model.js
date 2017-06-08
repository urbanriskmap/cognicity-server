import Promise from 'bluebird';

export default (config, db, logger) => ({

	// A list of all infrastructure matching a given type
	all: (city, type) => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT name, the_geom
			FROM infrastructure.${type}
			WHERE ($1 IS NULL OR tags->>'instance_region_code'=$1)`;

		// Setup values
		let values = [ city ];

		// Execute
		logger.debug(query, values);
		db.any(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	})

});
