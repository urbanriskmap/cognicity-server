/**
 * CogniCity Server /cards data model
 * @module src/api/cards/model
 **/
import Promise from 'bluebird';

/**
* Database interaction for Cards objects
* @alias module:src/api/cards/model
* @param {Object} config Server configuration
* @param {Object} db PG Promise database instance
* @param {Object} logger Configured Winston logger instance
* @return {Object} data Query methods
**/
export default (config, db, logger) => ({
  // Create a new card entry with the given cardId
  create: (body) => new Promise((resolve, reject) => {
    // Setup query
    let query = `INSERT INTO ${config.TABLE_GRASP_CARDS}
      (username, network, language, received)
      VALUES ($1, $2, $3, $4) RETURNING card_id`;

    // Setup values
    let values = [body.username, body.network, body.language, false];

    // Execute
    logger.debug(query, values);
    db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
      .then((data) => resolve(data))
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
}
      );
  }),

  // Return specific card by id
  byCardId: (cardId) => new Promise((resolve, reject) => {
    // Setup query
    let query = `SELECT c.card_id, c.username, c.network, c.language,
      c.received, CASE WHEN r.card_id IS NOT NULL THEN
        json_build_object('created_at', r.created_at, 'disaster_type',
        r.disaster_type, 'text', r.text, 'card_data', r.card_data, 'image_url',
        r.image_url, 'status', r.status)
      ELSE null END AS report
      FROM ${config.TABLE_GRASP_CARDS} c
      LEFT JOIN ${config.TABLE_GRASP_REPORTS} r USING (card_id)
      WHERE c.card_id = $1
      LIMIT 1`;

    // Setup values
    let values = [cardId];

    // Execute
    logger.debug(query, values);
    db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
      .then((data) => resolve(data))
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),

  // Add entry to the reports table and then update the card record accordingly
  submitReport: (card, body) => new Promise((resolve, reject) => {
    // Setup our queries
    let queries = [
      {
        query: `INSERT INTO ${config.TABLE_GRASP_REPORTS}
          (card_id, card_data, text, created_at, disaster_type, status,
            the_geom)
          VALUES ($1, $2, COALESCE($3,''), $4, $5, $6,
          ST_SetSRID(ST_Point($7,$8),4326))`,
        values: [card.card_id, body.card_data, body.text,
          body.created_at, body.disaster_type, 'Confirmed', body.location.lng,
          body.location.lat],
      },
      {
        query: `UPDATE ${config.TABLE_GRASP_CARDS}
          SET received = TRUE WHERE card_id = $1`,
        values: [card.card_id],
      },
      {
        query: `INSERT INTO ${config.TABLE_GRASP_LOG}
              (card_id, event_type)
              VALUES ($1, $2)`,
        values: [card.card_id, 'REPORT SUBMITTED'],
      },
    ];

    // Log queries to debugger
    for (let query of queries) logger.debug(query.query, query.values);

    // Execute in a transaction as both INSERT and UPDATE must happen together
    db.tx((t) => {
      return t.batch(queries.map((query) => t.none(query.query, query.values)));
    }).timeout(config.PGTIMEOUT)
      .then((data) => resolve(data))
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),

  // Update the reports table with new report details
  updateReport: (card, body) => new Promise((resolve, reject) => {
    // Setup our queries
    let queries = [
      {
        query: `UPDATE ${config.TABLE_GRASP_REPORTS} SET
          image_url = COALESCE($2, image_url)
          WHERE card_id = $1`,
        values: [card.card_id, body.image_url],
      },
      {
        query: `INSERT INTO ${config.TABLE_GRASP_LOG}
              (card_id, event_type)
              VALUES ($1, $2)`,
        values: [card.card_id, 'REPORT UPDATE (PATCH)'],
      },
    ];

    // Log queries to debugger
    for (let query of queries) logger.debug(query.query, query.values);

    // Execute in a transaction as both INSERT and UPDATE must happen together
    db.tx((t) => {
      return t.batch(queries.map((query) => t.none(query.query, query.values)));
    }).timeout(config.PGTIMEOUT)
      .then((data) => resolve(data))
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),

});
