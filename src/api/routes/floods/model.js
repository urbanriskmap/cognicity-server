import Promise from 'bluebird';

export default (config, db, logger) => ({

	// Get all flood reports for a given city
	// TODO: Aggregate and join to flood areas
	all: (city) => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT *
			FROM ${config.TABLE_REPORTS}
			WHERE $1 IS NULL OR tags->>'instance_region_code'=$1`;

		// Setup values
		let values = [ city ]

		// Execute
		logger.debug(query, values);
		db.any(query, values).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))

	}),

	// Update the REM status and append to the log
	updateREMStatus: (id, status) => new Promise((resolve, reject) => {

		// Setup query
		let query = `UPDATE ${config.TABLE_REM_STATUS}
			SET state=$1 WHERE local_area=$2`;

		// Setup values
		let values = [ status, id ]

		// Execute
		logger.debug(query, values);
		db.none(query, values).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))

	})

});
