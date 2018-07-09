/**
 * CogniCity Server /floods/timeseries data model
 * @module src/api/floods/timeseries/model
 **/
 import Promise from 'bluebird';

 /**
 * Methods to interact with flood layers in database
  * @alias module:src/api/floods/timeseries/model
  * @param {Object} config Server configuration
  * @param {Object} db PG Promise database instance
  * @param {Object} logger Configured Winston logger instance
  * @return {Object} Query methods
  */
export default (config, db, logger) => ({

  // Get all flood reports for a given city
  count: (start, end, city) => new Promise((resolve, reject) => {
    // Setup query
    let query = `SELECT series.ts, count(series.local_area) 
      FROM
        (SELECT (cognicity.rem_get_flood(ts)).local_area, ts
          FROM 
            generate_series(date_trunc('hour', $1::timestamp with time zone),
            date_trunc('hour', $2::timestamp with time zone),'1 hour')
      AS series(ts)) AS series,
      ${config.TABLE_LOCAL_AREAS} AS la
      WHERE 
        series.local_area = la.pkey AND
        ($3 IS NULL OR la.instance_region_code = $3)
      GROUP BY series.ts 
      ORDER BY series.ts`;

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
