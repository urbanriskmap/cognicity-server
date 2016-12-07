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
	// TODO: What is mandatory around title / text, any rules AND/OR?
	// TODO: Bulk endpoint for multiple POSTs
	api.post('/qlue', validate({
			body: Joi.object().keys({
				post_id: Joi.number().integer().required(),
				created_at: Joi.date().iso().required(),
				text: Joi.string(),
				image_url: Joi.string(),
				qlue_city: Joi.string().valid(config.API_FEEDS_QLUE_CITIES).required(),
				disaster_type: Joi.string().valid(config.API_FEEDS_QLUE_DISASTER_TYPES).required(),
				title: Joi.string(),
				location: Joi.object().required().keys({
					lat: Joi.number().min(-90).max(90).required(),
					lng: Joi.number().min(-180).max(180).required()
				})
			})
		}),
		(req, res, next) => feeds(config, db, logger).addQlueReport(req.body)
			.then((data) => res.json(data))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	return api;
}
