import { Router } from 'express';

// Import our data model
import floods from './model';

// Import any required utility functions
import { formatGeo, handleResponse, jwtCheck } from '../../../lib/util';

// Cap formatter helper
import Cap from '../../../lib/cap';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Rem status codes
const REM_STATES = {
	0: {
		severity: 'Cleared',
		levelDescription: 'NO FLOODING'
	},
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


export default ({ config, db, logger }) => {
	let api = Router();
	const cap = new Cap(logger); // Setup our cap formatter

	// Get a list of all floods
	// TODO: If minimum_state is not supplied then bring across everything
	api.get('/',
		validate({
			query: {
				city: Joi.any().valid(config.REGION_CODES),
				format: Joi.any().valid(['xml'].concat(config.FORMATS)).default(config.FORMAT_DEFAULT),
				geoformat: Joi.any().valid(['cap'].concat(config.GEO_FORMATS)).default(config.GEO_FORMAT_DEFAULT),
				minimum_state: Joi.number().integer().valid(Object.keys(REM_STATES))
			}
		}),
		(req, res, next) => {
			if (req.query.geoformat === 'cap' && req.query.format !== 'xml') res.status(400).json({ statusCode: 400, message: 'format must be \'xml\' when geoformat=\'cap\'' })
			else if (config.GEO_FORMATS.indexOf(req.query.geoformat) > -1 && req.query.format !== 'json') res.status(400).json({ statusCode: 400, message: 'format must be \'json\' when geoformat IN (\'geojson\',\'topojson\')' })
			else floods(config, db, logger).allGeo(req.query.city, req.query.minimum_state)
				.then((data) =>
					req.query.geoformat === 'cap' ?
						// If CAP format has been required first convert to geojson then to CAP
						formatGeo(data, 'geojson')
							.then((formatted) => res.status(200).set('Content-Type', 'text/xml').send(cap.geoJsonToAtomCap(formatted)))
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
	api.get('/states',
		validate({
			query: {
				city: Joi.any().valid(config.REGION_CODES),
				format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT)
			}
		}),
		(req, res, next) => floods(config, db, logger).all(req.query.city)
			.then((data) => handleResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
  );

	// TODO: Need a REM view of the world

	// Update the status of a specific flood
	// TODO: Discuss with Tom, what are we updating, flood status or REM state?  Endpoint naming is a little confusing
	api.put('/:id', jwtCheck,
		validate({
			params: { id: Joi.number().integer().required() },
			body: Joi.object().keys({
				state: Joi.number().integer().valid(Object.keys(REM_STATES)).required(),
			})
		}),
		(req, res, next) => floods(config, db, logger).updateREMStatus(req.params.id, req.body.state)
			.then((data) => handleResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
  );

	// TODO app.delete('/flood') : remove the status from the rem status and add a log to say we have done this

	return api;
}
