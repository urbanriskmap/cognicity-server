import { Router } from 'express';

// Import our data model
import archive from './model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse } from '../../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);

import validate from 'celebrate';

export default ({ config, db, logger }) => {
	let api = Router();

	// Get a list of all reports
	api.get('/', cacheResponse('1 minute'),

		validate({
			query: {
				city: Joi.any().valid(config.REGION_CODES),
        start: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ'),
        end: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ').options({convert: true}),
				format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
				geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
			}
		}),
		(req, res, next) => archive(config, db, logger).all(req.query.start, req.query.end, req.query.city)
			.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	return api;
};
