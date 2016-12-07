import { Router } from 'express';

// Import our data model
import reports from './model';

// Import any required utility functions
import { cacheResponse, handleResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

export default ({ config, db, logger }) => {
	let api = Router();

	// Get a list of all reports
	api.get('/', cacheResponse('1 minute'), 
		(req, res, next) => reports(config, db, logger).all(req.query.city)
			.then((data) => handleResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	// Get a single report
	api.get('/:id', cacheResponse('1 minute'), validate({ params: { id: Joi.number().integer().required() } }),
		(req, res, next) => reports(config, db, logger).byId(req.params.id)
			.then((data) => handleResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	return api;
}
