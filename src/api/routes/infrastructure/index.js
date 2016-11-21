import { Router } from 'express';

// Import our data model
import infrastructure from './model';

// Import any required utility functions
import { cache, toGeoJson } from '../../../lib/util';

export default ({ db, logger }) => {
	let api = Router();

	// Get a list of infrastructure by type
	const allByType = (req, res, next, type) => {
		infrastructure(db, logger).allByType(type)
			.then((json) => {
        // TODO: CAP (XML) support
				toGeoJson(json).then((geojson) => res.json(geojson)).catch((err) => next(err))
			})
			.catch((err) => {
				logger.error(err);
				next(err);
			});
	}

	// Mount the various endpoints
	api.get('/floodgates', cache('1 hour'), (req, res, next) => allByType(req, res, next, 'floodgates'));
  api.get('/pumps', cache('1 hour'), (req, res, next) => allByType(req, res, next, 'pumps'));
  api.get('/waterways', cache('1 hour'), (req, res, next) => allByType(req, res, next, 'waterways'));

	return api;
}
