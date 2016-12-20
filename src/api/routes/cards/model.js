import Promise from 'bluebird';

export default (config, db, logger) => ({

	// Create a new card entry with the given cardId
	create: (cardId, body) => new Promise((resolve, reject) => {

		// Setup query
		let query = `INSERT INTO ${config.TABLE_GRASP_CARDS}
			(card_id, username, network, language, received)
			VALUES ($1, $2, $3, $4, $5) RETURNING pkey`;

		// Setup values
		let values = [ cardId, body.username, body.network, body.language, false ]

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	}),

	// Return specific card by id
	byCardId: (cardId) => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT c.card_id, c.username, c.network, c.language, c.received,
			CASE WHEN r.card_id IS NOT NULL THEN
				json_build_object('created_at', r.created_at, 'disaster_type', r.disaster_type,
				'text', r.text, 'card_data', r.card_data, 'image_url', r.image_url,
				'status', r.status)
			ELSE null END AS report
			FROM ${config.TABLE_GRASP_CARDS} c
			LEFT JOIN ${config.TABLE_GRASP_REPORTS} r USING (card_id)
			WHERE c.card_id = $1
			LIMIT 1`;

		// Setup values
		let values = [ cardId ]

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	}),

	// Add an entry to the reports table and then update the card record accordingly
	submitReport: (card, body) => new Promise((resolve, reject) => {

		// Setup our queries
		let queries = [
			{
				query: `INSERT INTO ${config.TABLE_GRASP_REPORTS}
<<<<<<< HEAD
<<<<<<< HEAD
					(card_id, card_data, text, created_at, disaster_type, image_url, status, the_geom)
					VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_Point($8,$9),4326))`,
=======
					(card_id, card_data, text, created_at, disaster_type, status, the_geom)
<<<<<<< HEAD
					VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_Point($7,$8),4326))`,
>>>>>>> master
=======
					(card_id, card_data, text, created_at, disaster_type, status, the_geom)
					VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_Point($7,$8),4326))`,
>>>>>>> master
=======
					VALUES ($1, $2, COALESCE($3,''), $4, $5, $6, ST_SetSRID(ST_Point($7,$8),4326))`,
>>>>>>> master
				values: [ card.card_id, { flood_depth: body.water_depth }, body.text,
					body.created_at, 'flood', 'Confirmed', body.location.lng, body.location.lat  ]
			},
			{
				query: `UPDATE ${config.TABLE_GRASP_CARDS}
					SET received = TRUE WHERE card_id = $1`,
				values: [ card.card_id ]
			},
			{
				query: `INSERT INTO ${config.TABLE_GRASP_LOG}
							(card_id, event_type)
							VALUES ($1, $2)`,
				values: [ card.card_id, 'REPORT SUBMITTED' ]
			}
		]

		// Log queries to debugger
		for (let query of queries) logger.debug(query.query, query.values);

		// Execute in a transaction as both INSERT and UPDATE must happen together
		db.tx((t) => {
			return t.batch(queries.map((query) => t.none(query.query, query.values)))
		}).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	}),

	// Update the reports table with new report details
	updateReport: (card, body) => new Promise((resolve, reject) => {

		// Setup our queries
		let queries = [
			{
				query: `UPDATE ${config.TABLE_GRASP_REPORTS} SET
					card_data = COALESCE($2, card_data),
					text = COALESCE($3, text),
					image_url = COALESCE($4, image_url)
					WHERE card_id = $1`,
				values: [ card.card_id,
					body.water_depth ? { flood_depth: body.water_depth } : null,
					body.text, body.image_url ]
			},
			{
				query: `INSERT INTO ${config.TABLE_GRASP_LOG}
							(card_id, event_type)
							VALUES ($1, $2)`,
				values: [ card.card_id, 'REPORT UPDATES' ]
			}
		]

		// Log queries to debugger
		for (let query of queries) logger.debug(query.query, query.values);

		// Execute in a transaction as both INSERT and UPDATE must happen together
		db.tx((t) => {
			return t.batch(queries.map((query) => t.none(query.query, query.values)))
		}).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})

});
