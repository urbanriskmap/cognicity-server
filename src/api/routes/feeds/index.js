import {Router} from 'express';

// Import our data model
import feeds from './model';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';


export default ({config, db, logger}) => {
	let api = Router();

	// Create a new qlue record in the database
	// TODO: What is mandatory around title / text, any rules AND/OR?
	// TODO: Bulk endpoint for multiple POSTs
	api.post('/qlue', validate({
			body: Joi.object().keys({
				post_id: Joi.number().integer().required(),
				created_at: Joi.date().iso().required(),
				title: Joi.string().allow(''),
				text: Joi.string().allow('').required(),
				image_url: Joi.string(),
				qlue_city: Joi.string().valid(config.API_FEEDS_QLUE_CITIES).required(),
				disaster_type: Joi.string().valid(config.API_FEEDS_QLUE_DISASTER_TYPES).required(),
				location: Joi.object().required().keys({
					lat: Joi.number().min(-90).max(90).required(),
					lng: Joi.number().min(-180).max(180).required(),
				}),
			}),
		}),
		(req, res, next) => feeds(config, db, logger).addQlueReport(req.body)
			.then((data) => res.json(data))
			.catch((err) => {
				/* istanbul ignore next */
				logger.error(err);
				/* istanbul ignore next */
				next(err);
			})
	);

	// Create a new detik record in the database
	// TODO: What is mandatory around title / text, any rules AND/OR?
	// TODO: Bulk endpoint for multiple POSTs
	api.post('/detik', validate({
			body: Joi.object().keys({
				contribution_id: Joi.number().integer().required(),
				created_at: Joi.date().iso().required(),
				title: Joi.string().allow(''),
				text: Joi.string().allow('').required(),
				url: Joi.string().allow(''),
				image_url: Joi.string(),
				disaster_type: Joi.string().valid(config.API_FEEDS_DETIK_DISASTER_TYPES).required(),
				location: Joi.object().required().keys({
					latitude: Joi.number().min(-90).max(90).required(),
					longitude: Joi.number().min(-180).max(180).required(),
				}),
			}),
		}),
		(req, res, next) => feeds(config, db, logger).addDetikReport(req.body)
			.then((data) => res.json(data))
			.catch((err) => {
				/* istanbul ignore next */
				logger.error(err);
				/* istanbul ignore next */
				next(err);
			})
	);

	return api;
};
