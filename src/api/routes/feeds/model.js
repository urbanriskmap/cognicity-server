/**
 * CogniCity Server /feeds data model
 * @module src/api/feeds/model
 **/
 import Promise from 'bluebird';

 /**
 * Methods to interact with feeds layers in database
  * @alias module:src/api/feeds/model
  * @param {Object} config Server configuration
  * @param {Object} db PG Promise database instance
  * @param {Object} logger Configured Winston logger instance
  * @return {Object} Query methods
  */
export default (config, db, logger) => ({

  // Add a new qlue report
  addQlueReport: (body) => new Promise((resolve, reject) => {
    // Setup query
    let query = `INSERT INTO ${config.TABLE_FEEDS_QLUE}
       (post_id, created_at, disaster_type, text, image_url, title, qlue_city,
         the_geom)
      VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_Point($8,$9),4326))`;

    // Setup values
    let values = [body.post_id, body.created_at, body.disaster_type, body.text,
      body.image_url, body.title, body.qlue_city, body.location.lng,
      body.location.lat];

    // Execute
    logger.debug(query, values);
    db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
      .then(() => resolve({post_id: body.post_id, created: true}))
      .catch((err) => {
        if (err.constraint === 'reports_post_id_key') {
          resolve({post_id: body.post_id, created: false,
            message: `${body.post_id} already exists in reports table`});
        } else {
          reject(err);
        }
        });
    }),

  // Add a detik report
  addDetikReport: (body) => new Promise((resolve, reject) => {
    // Setup query
    let query = `INSERT INTO ${config.TABLE_FEEDS_DETIK}
    (contribution_id, created_at, disaster_type, title, text, url, image_url,
      the_geom)
    VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_POINT($8, $9),4326))`;

    // Setup values
    let values = [body.contribution_id, body.created_at, body.disaster_type,
      body.title, body.text, body.url, body.image_url, body.location.longitude,
      body.location.latitude];

    // Execute
    logger.debug(query, values);
    db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
      .then(() => resolve({contribution_id: body.contribution_id,
        created: true}))
      .catch((err) => {
        if (err.constraint === 'reports_contribution_id_key') {
          resolve({contribution_id: body.contribution_id, created: false,
            message: `${body.contribution_id}`
            + ` already exists in reports table`});
        } else {
        /* istanbul ignore next */
        reject(err);
        }
      });
  }),
});

// Add a detik report
addZurichReport: (body) => new Promise((resolve, reject) => {

	// Setup query
	let query = `INSERT INTO ${config.TABLE_FEEDS_ZURICH}
	(city, post_id, created_at, disaster_type, title, text, url, image_url, the_geom)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_SetSRID(ST_POINT($9, $10),4326))`;

	// Setup values
	let values = [ body.city, body.post_id, body.created_at, body.disaster_type, body.title, body.text,
		body.url, body.image_url, body.location.longitude, body.location.latitude	]

	// Execute
	logger.debug(query, values);
	db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
		.then(() => resolve({ contribution_id: body.post_id, created: true }))
		.catch((err) => {
			if (err.constraint === 'reports_post_id_key')
				resolve({ contribution_id: body.post_id, created: false, message: `${body.post_id} already exists in reports table`})
			else
					reject(err)
		})
})
});
