import Promise from 'bluebird';

export default (config, db, logger) => ({

	// Get all flood reports for a given city
	all: (city) => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT local_area, state, last_updated
			FROM ${config.TABLE_REM_STATUS} status, ${config.TABLE_LOCAL_AREAS} area
			WHERE status.local_area = area.pkey
			AND state IS NOT NULL AND status.state > 0
			AND ($1 IS NULL OR area.instance_region_code=$1)`;

		// Setup values
		let values = [ city ]

		// Execute
		logger.debug(query, values);
		db.any(query, values).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))

	}),

	// Get all flood reports for a given city
	allGeo: (city, minimum_state) => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT local_area, state, last_updated, geom_id, area_name, city_name, area.the_geom
			FROM ${config.TABLE_LOCAL_AREAS} area
			LEFT JOIN ${config.TABLE_REM_STATUS} status ON area.pkey = status.local_area
			WHERE state IS NOT NULL AND status.state > 0
			AND ($1 IS NULL OR area.instance_region_code=$1)`;
		// TODO: minimum_state functionality, if supplied filter, if not return everything
		// TODO: Look at COALESCE to get this working

		// Setup values
		let values = [ city, minimum_state ]

		// Execute
		logger.debug(query, values);
		db.any(query, values).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))

	}),

	// Update the REM state and append to the log
	updateREMState: (id, state) => new Promise((resolve, reject) => {

		// Setup query
		let query = `UPSERT ${config.TABLE_REM_STATUS}
			SET state=$1 WHERE local_area=$2`;

		// TODO: Wrap in a transaction
		// TODO: Postgres supports UPSERT now
		// TODO: If the report exists then it is an update, otherwise INSERT
		// TODO: Update and then add an entry to the log

		// Setup values
		let values = [ status, id ]

		// Execute
		logger.debug(query, values);
		db.none(query, values).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))

	})

});
