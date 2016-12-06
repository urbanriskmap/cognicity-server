import { Router } from 'express';

// Import our data model
import feeds from './model';

// Import any required utility functions
import { handleResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';


export default ({ config, db, logger }) => {
	let api = Router();

	// Create a new qlue record in the database
	// TODO: Agree schema and validation
	api.post('/qlue', validate({
			body: Joi.object().keys({
				post_id: Joi.string(),
				created_at: Joi.string(),
				text: Joi.string().required(),
				image_url: Joi.string(),
				qlue_city: Joi.string(),
				location: Joi.object().required().keys({
					lat: Joi.number().min(-90).max(90),
					lng: Joi.number().min(-180).max(180)
				})
			})
		}),
		(req, res, next) => feeds(config, db, logger).addQlueReport(req.body)
			.then((data) => handleResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	return api;
}
