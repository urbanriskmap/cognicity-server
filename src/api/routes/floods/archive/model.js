/**
 * CogniCity Server /floods/archive data model
 * @module src/api/floods/archive model
 **/
 import Promise from 'bluebird';

 /**
 * Methods to interact with flood layers in database
  * @alias module:src/api/floods/model
  * @param {Object} config Server configuration
  * @param {Object} db PG Promise database instance
  * @param {Object} logger Configured Winston logger instance
  * @return {Object} Query methods
  */
export default (config, db, logger) => ({

  // Get max state of all flood reports over time
  maxstate: (start, end, city) => new Promise((resolve, reject) => {
    // Setup query
    let query = `SELECT 
      mf.local_area AS area_id, 
      mf.changed AS last_updated,
      mf.max_state 
    FROM 
      cognicity.rem_get_max_flood($1, $2) AS mf, 
      ${config.TABLE_LOCAL_AREAS} AS la
    WHERE 
      mf.local_area = la.pkey AND
      ($3 IS NULL OR la.instance_region_code = $3)`;

    // Setup values
    let values = [start, end, city];

    // Execute
    logger.debug(query, values);
    db.any(query, values).timeout(config.PGTIMEOUT)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),
});

