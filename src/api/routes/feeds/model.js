import Promise from 'bluebird';

export default (config, db, logger) => ({

	// Add a new qlue report
	addQlueReport: (body) => new Promise((resolve, reject) => {

		// Setup query
		let query = `INSERT INTO ${config.TABLE_FEEDS_QLUE}
		 	(post_id, created_at, disaster_type, text, image_url, title, qlue_city, the_geom)
			VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_Point($8,$9),4326))`;

		// Setup values
		let values = [ body.post_id, body.created_at, body.disaster_type, body.text, body.image_url,
			body.title, body.qlue_city, body.location.lng, body.location.lat  ]

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.DB_TIMEOUT)
			.then(() => resolve({ post_id: body.post_id, created: true }))
			.catch((err) => {
				if (err.constraint === 'reports_post_id_key')
					resolve({ post_id: body.post_id, created: false, message: `${body.post_id} already exists in reports table` })
				else
					reject(err)
			})
	})

});
