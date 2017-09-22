/**
 * CogniCity Server /reports endpoint
 * @module src/api/reports/index
 **/
 import {Router} from 'express';

// Import our data model
import textquery from './model';

// Import any required utility functions
import {cacheResponse, handleGeoResponse} from '../../../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);

import validate from 'celebrate';

/**
 * Methods to get current flood reports from database
 * @alias module:src/api/reports/index
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} api Express router object for reports route
 */
export default ({config, db, logger}) => {
	let api = Router(); // eslint-disable-line new-cap

	// Get a list of all reports
	api.get('/', cacheResponse('1 minute'),

		validate({
			query: {
				city: Joi.any().valid(config.REGION_CODES),
        start: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ').required(),
				end: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ')
					.min(Joi.ref('start')).required(),
        preparedSQL: Joi.string().allow(''),
				format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
				geoformat: Joi.any().valid(config.GEO_FORMATS)
					.default(config.GEO_FORMAT_DEFAULT),
			},
		}),
		(req, res, next) => textquery(config, db, logger)
			.rangeQuery(req.query.start, req.query.end, req.query.preparedSQL, req.query.city)
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