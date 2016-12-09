import Promise from 'bluebird';

export default (config, db, logger) => ({

	// A list of all infrastructure matching a given type
	all: () => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT code, name, the_geom
			FROM cognicity.instance_regions`;

		// Execute
		logger.debug(query);
		db.any(query).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})

});
