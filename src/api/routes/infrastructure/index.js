import { Router } from 'express';

// Import our data model
import infrastructure from './model';

// Import any required utility functions
import { handleResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';


export default ({ config, db, logger }) => {
	let api = Router();

	// Get a list of infrastructure by type for a given city
	api.get('/:type', validate({ params: { type: Joi.any().valid(config.INFRASTRUCTURE_TYPES) } }),
		(req, res, next) => infrastructure(config, db, logger).all(req.query.city, req.params.type)
			.then((data) => handleResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	return api;
}
