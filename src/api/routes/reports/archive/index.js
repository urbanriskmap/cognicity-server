import {Router} from 'express';

// Import our data model
import archive from './model';

// Import any required utility functions
import {cacheResponse, handleGeoResponse} from '../../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);

import validate from 'celebrate';

export default ({config, db, logger}) => {
	let api = Router();

	// Get a list of all reports
	api.get('/', cacheResponse('1 minute'),

		validate({
			query: {
				city: Joi.any().valid(config.REGION_CODES),
				// TODO - does it matter than end time can be "before" start time? Can reference arguments using Joi.ref('start')
        start: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ').required(),
        end: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ').required(),
				// TODO we should restrict output to geo/topojson only. CAP format doesn't make sense for historic data.
				format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
				geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT),
			},
		}),
		(req, res, next) => archive(config, db, logger).all(req.query.start, req.query.end, req.query.city)
			.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				/* istanbul ignore next */
				logger.error(err);
				/* istanbul ignore next */
				next(err);
			})
	);

	return api;
};
