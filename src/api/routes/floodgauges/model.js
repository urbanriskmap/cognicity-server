import Promise from 'bluebird';

export default (config, db, logger) => ({

	// TODO: Should this just be last hour or will we accept range as params?
	// Return all flood gauge reports in last hour
	// Optional: city (Petabencana.id Instance Region 3 letter code)
	all: (city) => new Promise((resolve, reject) => {
		let query = `SELECT gaugeid, gaugenameid, the_geom,
			array_to_json(array_agg((measuredatetime, depth, warninglevel,
					warningnameid) ORDER BY measuredatetime ASC)) as observations
			FROM ${config.TABLE_FLOODGAUGE_REPORTS}
			WHERE measuredatetime >= to_timestamp($1)
			AND $2 IS NULL OR tags->>'instance_region_code'=$2
			GROUP BY gaugeid, the_geom, gaugenameid LIMIT $3`;

		// Setup values
		let timeWindow = (Date.now() / 1000) - config.API_FLOODGAUGE_REPORTS_TIME_WINDOW;
		let values = [ timeWindow, city, config.API_FLOODGAUGE_REPORTS_LIMIT ]

		// Execute
		logger.debug(query, values);
		db.any(query, values).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))

	}),

	// Return specific flood gauge report by id
	byId: (id) => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT gaugeid, gaugenameid, the_geom,
			array_to_json(array_agg((measuredatetime, depth, warninglevel,
					warningnameid) ORDER BY measuredatetime ASC)) as observations
			FROM ${config.TABLE_FLOODGAUGE_REPORTS}
			WHERE pkey = $1
			GROUP BY gaugeid, the_geom, gaugenameid`;

		// Setup values
		let values = [ id ]

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})

});
