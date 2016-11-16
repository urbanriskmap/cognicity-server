import { Router } from 'express';
import jwt from 'express-jwt';

// Get the current version
import { version } from '../../package.json';

// Import our routes
import facets from './routes/facets';
import floods from './routes/floods';
import infrastructure from './routes/infrastructure';

export default ({ config, db }) => {
	let api = Router();

	// Configure our JWT checker TODO: Add expiry check
	const jwtCheck = jwt({
	  secret: new Buffer(config.AUTH0_SECRET, 'base64'),
	  audience: config.AUTH0_CLIENT_ID
	});

	// Return the API version
	// TODO: Perhaps expose some API metadata?
	api.get('/', (req, res) => {
		res.json({ version });
	});

	// Mount the various endpoints
	api.use('/facets', facets({ config, db }));
	api.use('/floods', jwtCheck, floods({ config, db }));
	api.use('/infrastructure', infrastructure({ config, db }));

	return api;
}
