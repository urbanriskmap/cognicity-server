/**
 * CogniCity Server /reports data model
 * @module src/api/reports/model
 **/
 import Promise from 'bluebird';

 const _upsertAlertUser = (config, db, logger, body) => new Promise((resolve, reject) => {
   // First check if user exists
   let query = `SELECT pkey FROM ${config.TABLE_ALERT_USERS}
   WHERE username = $1 AND network = $2`;

   // Params
   let values = [ body.username, body.network, body.language ];

   // Log
   logger.debug(query, values);

   // Execute
   db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
     .then((data) => {
       if ( data && data.pkey !== null ){
         resolve({userkey: data.pkey})
       }
       else {
         let query = `INSERT INTO ${config.TABLE_ALERT_USERS}
           (username, network, language, subscribed)
           VALUES ($1, $2, $3, TRUE) RETURNING pkey;`

         // Get params
         let values = [ body.username, body.network, body.language ];

         // log
         logger.debug(query, values)

         // execute
         db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
           .then((data) => {
             resolve({userkey: data.pkey})
           })
           .catch((err) => {
             reject(err);
           })
         }
       })
       .catch((err) => {
         reject(err);
       })
     })

/**
 * Methods to get current flood reports from database
 * @alias module:src/api/reports/model
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} Query methods
 */
export default (config, db, logger) => ({

	// Return specific report by id
	byUser: (username, network) => new Promise((resolve, reject) => {
		// Setup query

    let query = `SELECT l.pkey as location_key, l.userkey, l.subscribed, u.username, u.network, u.language, l.alert_log, l.the_geom FROM ${config.TABLE_ALERT_USERS} u, ${config.TABLE_ALERT_LOCATIONS} l WHERE u.pkey = l.userkey AND u.username = $1 AND u.network = $2`;

		// Setup values
		let values = [username, network];

		// Execute
		logger.debug(query, values);
		db.any(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			/* istanbul ignore next */
			.catch((err) => {
				/* istanbul ignore next */
				reject(err);
			});
	}),

  // Create an alert object
  create: (body) => new Promise ((resolve, reject) => {

      // upsert user
      _upsertAlertUser(config, db, logger, body)
        .then((data) => {

          // store user key
          let userkey = data.userkey

          // Now register alert location against user
          let query = `INSERT INTO ${config.TABLE_ALERT_LOCATIONS}
          (userkey, subscribed, the_geom, alert_log) VALUES ($1, $2, ST_SetSRID(ST_Point($3, $4),4326),$5::jsonb) RETURNING pkey`;

          // params
          let now = new Date().toISOString(); // Set a time in the log
          let values = [ userkey, body.subscribed, body.location.lng, body.location.lat, JSON.stringify([{event:"created", timestamp:now}])];

          // server log query
          logger.debug(query, values);

          // execute
          db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => {
              let location_key = data.pkey;
              resolve({userkey, location_key});
          })
          /* istanbul ignore next */
          .catch((err) => {
            /* istanbul ignore next */
            reject(err);
          });
        })
        /* istanbul ignore next */
        .catch((err) => {
          /* istanbul ignore next */
          reject(err);
        });
    }),

    // Update an alert object

    update: (body) => new Promise ((resolve, reject) => {

      // query
      let query = `UPDATE  ${config.TABLE_ALERT_LOCATIONS} SET (subscribed, alert_log) = (SELECT $3::bool, alert_log || $4::jsonb FROM ${config.TABLE_ALERT_LOCATIONS} WHERE userkey = $1 AND pkey = $2) WHERE userkey = $1 AND pkey = $2 RETURNING pkey as location_key, userkey, subscribed`;

      // params
      let values = [ body.userkey, body.location_key, body.subscribed, JSON.stringify(body.log_event)];

      // log
      logger.debug(query, values);

      // execute
      db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        })
    }),
});
