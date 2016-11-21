import Promise from 'bluebird';

export default (config, db, logger) => ({

	// Return all reports in last hour
	// Optional: city (Petabencana.id Instance Region 3 letter code)
	all: (city) => new Promise((resolve, reject) => {
		let oneHourAgo = Date.now() / 1000 - (1000 * 60);
		let sql = `select pkey, created_at at time zone 'ICT' created_at, source,
			status, url, image_url, disaster_type, report_data, tags, title, text
			the_geom
			from cognicity.all_reports
			where created_at >= to_timestamp(${oneHourAgo})`;
		if (city) sql += ` and city=${city}`;
		// TODO: No city column?
		// TODO: What to return if no entries?
		logger.debug(sql);
		db.any(sql).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	}),

	// Return all reports in last hour
	// Optional: city (Petabencana.id Instance Region 3 letter code)
	byId: (id) => new Promise((resolve, reject) => {
		let sql = `select pkey, created_at at time zone 'ICT' created_at, source,
			status, url, image_url, disaster_type, report_data, tags, title, text
			the_geom
			from cognicity.all_reports
			where pkey = ${id}`;
		logger.debug(sql);
		db.any(sql).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})

});
