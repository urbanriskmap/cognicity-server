import Promise from 'bluebird';
// TODO: Should we retry the DB connection or restart the app?

// Import DB library
const pgp = require('pg-promise')({
  // Initialization Options
  promiseLib: Promise // Use bluebird for enhanced Promises
  // TODO: Any postgres options required?
}) ;

export default (config, logger) => new Promise((resolve, reject) => {

	// Build the connection string
	const cn = `postgres://${config.DB_USERNAME}:${config.DB_PASSWORD}@${config.DB_HOSTNAME}:${config.DB_PORT}/${config.DB_NAME}?ssl=${config.DB_SSL}`;

	// Setuo the connection
	let db = pgp(cn);

	// Make sure we can connect, if so resolve, if not reject
	db.proc('version').timeout(config.DB_TIMEOUT)
		.then(() => resolve(db))
		.catch((err) => {
			logger.error(err);
			reject(err);
		});

});
