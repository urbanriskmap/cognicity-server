import { Router } from 'express';

// Import our data model
import floods from './model';

// Import any required utility functions
import { handleResponse } from '../../../lib/util';

export default ({ config, db, logger }) => {
	let api = Router();

	// Mount the various endpoints
	api.get('/', (req, res, next) => floods(config, db, logger).all()
		.then((data) => handleResponse(data, req, res, next))
		.catch((err) => {
			logger.error(err);
			next(err);
		})
  );

	return api;
}
