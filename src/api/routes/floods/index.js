import { Router } from 'express';

// Import our data model
import floods from './model';

// Import any required utility functions
import { handleGeoResponse, handleResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Rem status codes
const REM_STATUS = {
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

	// Get a list of all floods
	api.get('/',
		validate({
			query: {
				city: Joi.any().valid(config.REGION_CODES),
				format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
				geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
			}
		}),
		(req, res, next) => floods(config, db, logger).all()
			.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
  );

	// TODO: Need a REM view of the world

	// Update the status of a specific flood
	// TODO: Should we put the REM logic into a separate endpoint?
	api.put('/:id', validate({
		params: { id: Joi.number().integer().required() },
		body: Joi.object().keys({
			state: Joi.number().integer().valid(Object.keys(REM_STATUS)),
		})
	}),
		(req, res, next) => floods(config, db, logger).updateREMStatus(req.params.id, req.body.status)
			.then((data) => handleResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
  );

	// TODO: Implement Cap functionality

	return api;
}
