import { Router } from 'express';

// Import our data model
import infrastructure from './model';

// Import any required utility functions
import { toGeoJson } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';


export default ({ config, db, logger }) => {
	let api = Router();

	// Get a list of infrastructure by type
	const allByType = (req, res, next, type) => {
		infrastructure(config, db, logger).allByType(type)
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
	api.get('/:type', validate({ params: { type: Joi.any().valid(config.INFRASTRUCTURE_TYPES) } }),
		(req, res, next) => allByType(req, res, next, req.params.type));

	return api;
}
