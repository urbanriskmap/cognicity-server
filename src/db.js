// Import DB library
const pgp = require('pg-promise')({
	// Postgres options TODO: Any postgres options required?
}) ;

// Import config
import config from './config';

export default callback => {

	// Build the connection string
	const cn = `postgres://${config.DB_USERNAME}:${config.DB_PASSWORD}@${config.DB_HOSTNAME}:${config.DB_PORT}/${config.DB_NAME}?ssl=config.pg.ssl`;

	// Connect to postgres
	let db = pgp(cn);

	// Return the DB conection
	callback(db);
}
