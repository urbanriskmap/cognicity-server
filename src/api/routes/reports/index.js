import { Router } from 'express';

// Import our data model
import reports from './model';

// Import any required utility functions
import { cache, toGeoJson } from '../../../lib/util';

export default ({ db, logger }) => {
	let api = Router();

	// Get a list of all reports
	const all = (req, res, next, city) => {
		reports(db, logger).all(city)
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

	return api;
}
