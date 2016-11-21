import { Router } from 'express';

// Import our data model
import reports from './model';

// Import any required utility functions
import { cache, toGeoJson } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

export default ({ config, db, logger }) => {
	let api = Router();

	// Get a list of all reports
	const all = (req, res, next, city) => {
		reports(config, db, logger).all(city)
			.then((json) => {
				toGeoJson(json).then((geojson) => res.json(geojson)).catch((err) => next(err))
			})
			.catch((err) => {
				logger.error(err);
				next(err);
			});
	}

	// Get a single report TODO: Merge this into a single 'formatResponse' utility function
	const byId = (req, res, next, id) => {
		reports(db, logger).byId(id)
			.then((json) => {
				toGeoJson(json).then((geojson) => res.json(geojson)).catch((err) => next(err))
			})
			.catch((err) => {
				logger.error(err);
				next(err);
			});
	}

	// Mount the various endpoints
	api.get('/', cache('1 minute'), (req, res, next) => all(req, res, next, req.query.city));
	api.get('/:id', validate({ params: { id: Joi.number().integer() } }),
		cache('1 minute'), (req, res, next) => byId(req, res, next, req.params.id));

	return api;
}
