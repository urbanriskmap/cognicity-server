import { Router } from 'express';

// Import our data model
import floods from './model';

// Import any required utility functions
import { cacheResponse, formatGeo, jwtCheck } from '../../../lib/util';

// Caching
import apicache from 'apicache';
const CACHE_GROUP_FLOODS = '/floods';
const CACHE_GROUP_FLOODS_STATES = '/floods/states';

// Cap formatter helper
import Cap from '../../../lib/cap';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Rem status codes
const REM_STATES = {
	1: {
		severity: 'Unknown',
		levelDescription: 'AN UNKNOWN LEVEL OF FLOODING - USE CAUTION -'
	},
	2: {
		severity: 'Minor',
		levelDescription: 'FLOODING OF BETWEEN 10 and 70 CENTIMETERS'
	},
	3: {
		severity: 'Moderate',
		levelDescription: 'FLOODING OF BETWEEN 71 and 150 CENTIMETERS'
	},
	4: {
		severity: 'Severe',
		levelDescription: 'FLOODING OF OVER 150 CENTIMETERS'
	}
}

// Function to clear out the cache
const clearCache = () => {
	apicache.clear(CACHE_GROUP_FLOODS);
	apicache.clear(CACHE_GROUP_FLOODS_STATES);
}

export default ({ config, db, logger }) => {
	let api = Router();
	const cap = new Cap(logger); // Setup our cap formatter

	// Get a list of all floods
	api.get('/', cacheResponse(config.CACHE_DURATION_FLOODS),
		validate({
			query: {
				city: Joi.any().valid(config.REGION_CODES),
				format: Joi.any().valid(['xml'].concat(config.FORMATS)).default(config.FORMAT_DEFAULT),
				geoformat: Joi.any().valid(['cap'].concat(config.GEO_FORMATS)).default(config.GEO_FORMAT_DEFAULT),
				minimum_state: Joi.number().integer().valid(Object.keys(REM_STATES))
			}
		}),
		(req, res, next) => {
			req.apicacheGroup = CACHE_GROUP_FLOODS;
			if (req.query.geoformat === 'cap' && req.query.format !== 'xml') res.status(400).json({ statusCode: 400, message: 'format must be \'xml\' when geoformat=\'cap\'' })
			else if (config.GEO_FORMATS.indexOf(req.query.geoformat) > -1 && req.query.format !== 'json') res.status(400).json({ statusCode: 400, message: 'format must be \'json\' when geoformat IN (\'geojson\',\'topojson\')' })
			else floods(config, db, logger).allGeo(req.query.city, req.query.minimum_state)
				.then((data) =>
					req.query.geoformat === 'cap' ?
						// If CAP format has been required first convert to geojson then to CAP
						formatGeo(data, 'geojson')
							.then((formatted) => res.status(200).set('Content-Type', 'text/xml').send(cap.geoJsonToAtomCap(formatted.features)))
							.catch((err) => next(err)) :
						// Otherwise hand off to geo formatter
						formatGeo(data, req.query.geoformat)
							.then((formatted) => res.status(200).json({ statusCode: 200, result: formatted }))
							.catch((err) => next(err))
				)
				.catch((err) => {
					logger.error(err);
					next(err);
				})
		}
  );

	// Just get the states without the geographic boundaries
	api.get('/states', cacheResponse(config.CACHE_DURATION_FLOODS_STATES),
		validate({
			query: {
				city: Joi.any().valid(config.REGION_CODES),
				format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
				minimum_state: Joi.number().integer().valid(Object.keys(REM_STATES))
			}
		}),
		(req, res, next) => {
			req.apicacheGroup = CACHE_GROUP_FLOODS_STATES;
			floods(config, db, logger).all(req.query.city, req.query.minimum_state)
				.then((data) => res.status(200).json({statusCode: 200, result: data}))
				.catch((err) => {
					logger.error(err);
					next(err);
				})
		}
  );

	// Update the flood status of a local area
	api.put('/:localAreaId', jwtCheck,
		validate({
			params: { localAreaId: Joi.number().integer().required() },
			body: Joi.object().keys({
				state: Joi.number().integer().valid(Object.keys(REM_STATES).map((state) => parseInt(state))).required(),
			})
		}),
		(req, res, next) => floods(config, db, logger).updateREMState(req.params.localAreaId, req.body.state)
			.then(() => {
				clearCache();
				res.status(200).json({localAreaId: req.params.localAreaId, state: req.body.state, updated: true});
			})
			.catch((err) => {
				logger.error(err);
				next(err);
			})
  );

	// Remove the flood status of a local and add a log entry for audit
	api.delete('/:localAreaId', jwtCheck,
		validate({
			params: { localAreaId: Joi.number().integer().required() },
		}),
		(req, res, next) => floods(config, db, logger).clearREMState(req.params.localAreaId)
			.then(() => {
				clearCache();
				res.status(200).json({localAreaId: req.params.localAreaId, state: null, updated: true})
			})
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	return api;
}