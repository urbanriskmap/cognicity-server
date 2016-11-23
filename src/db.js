import Promise from 'bluebird';

// Import DB library
const pgp = require('pg-promise')({
  // Initialization Options
  promiseLib: Promise // Use bluebird for enhanced Promises
}) ;

export default (config, logger) => new Promise((resolve, reject) => {

	// Build the connection string
	const cn = `postgres://${config.DB_USERNAME}:${config.DB_PASSWORD}@${config.DB_HOSTNAME}:${config.DB_PORT}/${config.DB_NAME}?ssl=${config.DB_SSL}`;
  logger.debug(cn);

	// Setup the connection
	let db = pgp(cn);

	// Make sure we can connect, if so resolve, if not reject
	db.proc('version').timeout(config.DB_TIMEOUT)
		.then(() => resolve(db))
		.catch((err) => {
			logger.error(err);
			reject(err);
		});

});
