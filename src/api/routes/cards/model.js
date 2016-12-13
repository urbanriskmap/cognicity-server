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
	// TODO: Agree properties to return
	byCardId: (cardId) => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT *
			FROM ${config.TABLE_GRASP_CARDS}
			WHERE card_id = $1`;

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

		// Execute in a transaction as both INSERT and UPDATE must happen together
		// TODO: add debug logging here
		db.tx((t) => {
			return t.batch([
				t.none(`INSERT INTO ${config.TABLE_GRASP_REPORTS}
					(card_id, card_data, text, created_at, disaster_type, image_url, status, the_geom)
					VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_Point($8,$9),4326))`,
					[ card.card_id, { flood_depth: body.water_depth }, body.text,
						body.created_at, 'flood', body.image_url, 'Confirmed',
						body.location.lng, body.location.lat  ]),
        t.none(`UPDATE ${config.TABLE_GRASP_CARDS}
					SET received = TRUE WHERE card_id = $1`, [card.card_id]),
				t.none(`INSERT INTO ${config.TABLE_GRASP_LOG}
							(card_id, event_type)
							VALUES ($1, $2)`, [card.card_id, 'REPORT SUBMITTED']),
      ])
		}).timeout(config.DB_TIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})

});
