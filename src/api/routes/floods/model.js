/**
 * CogniCity Server /floods data model
 * @module src/api/floods/model
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

  // Get all flood reports for a given city
  all: (city, minimumState) => new Promise((resolve, reject) => {
    // Setup query
    let query = `SELECT local_area as area_id, state, last_updated
      FROM ${config.TABLE_REM_STATUS} status, ${config.TABLE_LOCAL_AREAS} area
      WHERE status.local_area = area.pkey
      AND state IS NOT NULL AND ($2 IS NULL OR state >= $2)
      AND ($1 IS NULL OR area.instance_region_code=$1)`;

    // Setup values
    let values = [city, minimumState];

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

  // Get all flood reports for a given city
  allGeo: (city, minimumState) => new Promise((resolve, reject) => {
    // Setup query
    let query = `SELECT la.the_geom, la.pkey as area_id, la.geom_id,
      la.area_name, la.parent_name, la.city_name, la.district_id::varchar,
      rs.state, rs.last_updated
      FROM ${config.TABLE_LOCAL_AREAS} la
      ${minimumState ? 'JOIN' : 'LEFT JOIN'}
      (SELECT local_area, state, last_updated FROM ${config.TABLE_REM_STATUS}
      WHERE state IS NOT NULL AND ($2 IS NULL OR state >= $2)) rs
      ON la.pkey = rs.local_area
      WHERE $1 IS NULL OR instance_region_code = $1`;

    // Setup values
    let values = [city, minimumState];

    // Execute
    logger.debug(query, values);
    db.any(query, values).timeout(config.PGTIMEOUT)
      .then((data) => {
        resolve(data);
      })
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),

  // Update the REM state and append to the log
  updateREMState: (localAreaId, state, username) =>
    new Promise((resolve, reject) => {
      // Setup a timestamp with current date/time in ISO format
      let timestamp = (new Date()).toISOString();

      // Setup our queries
      let queries = [
        {
          query: `INSERT INTO ${config.TABLE_REM_STATUS}
            ( local_area, state, last_updated )
            VALUES ( $1, $2, $3 )
            ON CONFLICT (local_area) DO
            UPDATE SET state=$2, last_updated=$3`,
          values: [localAreaId, state, timestamp],
        },
        {
          query: `INSERT INTO ${config.TABLE_REM_STATUS_LOG}
            ( local_area, state, changed, username )
            VALUES ( $1, $2, $3, $4 )`,
          values: [localAreaId, state, timestamp, username],
        },
      ];

      // Log queries to debugger
      for (let query of queries) logger.debug(query.query, query.values);

      // Execute in a transaction as both INSERT and UPDATE must happen together
      db.tx((t) => {
        return t.batch(queries.map((query) =>
        t.none(query.query, query.values)));
      }).timeout(config.PGTIMEOUT)
        .then((data) => {
          resolve(data);
        })
        /* istanbul ignore next */
        .catch((err) => {
          /* istanbul ignore next */
          reject(err);
        });
    }),

  // Remove the REM state record and append to the log
  clearREMState: (localAreaId, username) => new Promise((resolve, reject) => {
    // Setup a timestamp with current date/time in ISO format
    let timestamp = (new Date()).toISOString();

    // Setup our queries
    let queries = [
      {
        query: `DELETE FROM ${config.TABLE_REM_STATUS}
          WHERE local_area = $1`,
        values: [localAreaId],
      },
      {
        query: `INSERT INTO ${config.TABLE_REM_STATUS_LOG}
          ( local_area, state, changed, username )
          VALUES ( $1, $2, $3, $4 )`,
        values: [localAreaId, null, timestamp, username],
      },
    ];

    // Log queries to debugger
    for (let query of queries) logger.debug(query.query, query.values);

    // Execute in a transaction as both INSERT and UPDATE must happen together
    db.tx((t) => {
      return t.batch(queries.map((query) => t.none(query.query, query.values)));
    }).timeout(config.PGTIMEOUT)
      .then((data) => {
        resolve(data);
      })
      /* istanbul ignore next */
      .catch((err) => {
        /* istanbul ignore next */
        reject(err);
      });
  }),

});
