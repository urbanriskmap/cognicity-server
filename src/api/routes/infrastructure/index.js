import { Router } from 'express';

// Import our data model
import infrastructure from './model';

// Import any required utility functions
import { cache, jwtCheck, toGeoJson } from '../../../lib/util';

// Setup validation
import Joi from 'joi';
import validate from 'celebrate';
// TODO: Should return a 4xx error

const schema =  {
  query: {
    token: Joi.string().token().required()
  }
}

export default ({ config, db, logger }) => {
	let api = Router();

	// Get a list of infrastructure by type
	const allByType = (req, res, next, type) => {
		infrastructure(db).allByType(type)
			.then((json) => {
				toGeoJson(json).then((geojson) => res.json(geojson)).catch((err) => next(err))
			})
			.catch((err) => {
				logger.error(err);
				next(err);
			});
	}

	// Mount the various endpoints
	api.get('/floodgates', validate(schema), cache('1 minute'), (req, res, next) => allByType(req, res, next, 'floodgates'));
  api.get('/pumps', cache('30 seconds'), (req, res, next) => allByType(req, res, next, 'pumps'));
  api.get('/waterways', cache('5 minutes'), (req, res, next) => allByType(req, res, next, 'waterways'));

	return api;
}
