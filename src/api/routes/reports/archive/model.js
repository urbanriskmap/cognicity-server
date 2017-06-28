import Promise from 'bluebird';

export default (config, db, logger) => ({

	/**
	 * Return all reports within a defined time period, and optionally city
	 * @param {integer} timeperiod Length of time period in seconds
	 * @param {string} city Optional, instance region code (e.g. 'jbd')
	 */
	all: (start, end, city) => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT pkey, created_at, source,
			status, url, image_url, disaster_type, report_data, tags, title, text, the_geom
			FROM ${config.TABLE_REPORTS}
			WHERE created_at >= $1::timestamp with time zone
      AND created_at <= $2::timestamp with time zone
			AND ($3 IS NULL OR tags->>'instance_region_code'=$3)
			ORDER BY created_at DESC LIMIT $4`;

		//var timeWindow = (Date.now() / 1000) - timeperiod;

		let values = [ start, end, city, config.API_REPORTS_LIMIT ];

		// Execute
		logger.debug(query, values);
		db.any(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	})
});
