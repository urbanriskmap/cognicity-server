import { Router } from 'express';

// Import the dependencies we need to handle the request
import errorHandler from 'api-error-handler';

// Get the current version
import { version } from '../../package.json';

// Import our routes
import floods from './routes/floods';
import infrastructure from './routes/infrastructure';

export default ({ config, db, logger }) => {
	let api = Router();

	// Return the API version
	// TODO: Perhaps expose some API metadata?
	api.get('/', (req, res) => {
		res.json({ version });
	});

	// Mount the various endpoints
	api.use('/floods', floods({ config, db, logger }));
	api.use('/infrastructure', infrastructure({ config, db, logger }));

	// Set 400 status for validation errors
	api.use((err, req, res, next) => {
		if (err.isJoi) err.status = 400;
		next(err);
	})

	// Handle errors gracefully returning nicely formatted json
	api.use(errorHandler());

	return api;
}
