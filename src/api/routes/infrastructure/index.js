import { Router } from 'express';

// Import our data model
import infrastructure from './model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';


export default ({ config, db, logger }) => {
	let api = Router();

	// Get a list of infrastructure by type for a given city
	api.get('/:type', cacheResponse('1 hour'),
		validate({
			params: { type: Joi.any().valid(config.INFRASTRUCTURE_TYPES) },
			query: {
				city: Joi.any().valid(config.REGION_CODES),
				format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
				geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
			}
		}),
		(req, res, next) => infrastructure(config, db, logger).all(req.query.city, req.params.type)
			.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	return api;
}
