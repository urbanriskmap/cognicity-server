import Promise from 'bluebird';

export default (config, db, logger) => ({

	// Return all reports within the defined max period
	// Optional: city (Petabencana.id Instance Region 3 letter code)
	all: (city,timeperiod) => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT pkey, created_at, source,
			status, url, image_url, disaster_type, report_data, tags, title, text, the_geom
			FROM ${config.TABLE_REPORTS}
			WHERE created_at >= to_timestamp($1)
			AND ($2 IS NULL OR tags->>'instance_region_code'=$2)
			ORDER BY created_at DESC LIMIT $3`;

		var timeWindow = (Date.now() / 1000) - timeperiod;

		let values = [ timeWindow, city, config.API_REPORTS_LIMIT ];

		// Execute
		logger.debug(query, values);
		db.any(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	}),

	// Return specific report by id
	byId: (id) => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT pkey, created_at, source,
			status, url, image_url, disaster_type, report_data, tags, title, text, the_geom
			FROM ${config.TABLE_REPORTS}
			WHERE pkey = $1`;

		// Setup values
		let values = [ id ]

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})

});
