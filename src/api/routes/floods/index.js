import { Router } from 'express';

// Import our data model
import floods from './model';

// Import any required utility functions
import { cache, toGeoJson } from '../../../lib/util';

export default ({ db, logger }) => {
	let api = Router();

	// Mount the various endpoints
	api.get('/', cache('1 minute'), (req, res, next) => floods(db, logger).all()
		.then((json) => {
      // TODO: CAP (XML) support
			toGeoJson(json).then((geojson) => res.json(geojson)).catch((err) => next(err))
		})
		.catch((err) => {
			logger.error(err);
			next(err);
		})
  );

	return api;
}
