import { Router } from 'express';

// Import our data model
import cards from './model';

// Import any required utility functions
import { cacheResponse, handleResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Import ID generator
import shortid from 'shortid';


export default ({ config, db, logger }) => {
	let api = Router();

	// Create a new card and if successful return generated cardId
	api.post('/',
		validate({
			body: Joi.object().keys({
				username: Joi.string().required(),
				network: Joi.string().required(),
				language: Joi.string().valid(config.LANGUAGES).required()
			})
		}),
		(req, res, next) => {
			let cardId = shortid.generate();
			cards(config, db, logger).create(cardId, req.body)
				.then((data) => data ? res.status(200).json({ cardId: cardId, created: true }) :
					next(new Error('Failed to create card')))
				.catch((err) => {
					logger.error(err);
					next(err);
				})
		}
	);

	// Check for the existence of a card
	api.head('/:cardId', cacheResponse('1 minute'),
		validate({
			params: { cardId: Joi.string().required() }
		}),
		(req, res, next) => cards(config, db, logger).byCardId(req.params.cardId)
			.then((data) => data ? res.status(200).end() : res.status(404).end())
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	// Return a card
	api.get('/:cardId', cacheResponse('1 minute'),
		validate({
			params: { cardId: Joi.string().min(7).max(14).required() }
		}),
		(req, res, next) => cards(config, db, logger).byCardId(req.params.cardId)
			.then((data) => handleResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	// Update a card record
	api.put('/:cardId', validate({
		params: { cardId: Joi.string().min(7).max(14).required() },
		body: Joi.object().keys({
			water_depth: Joi.number().integer().min(0).max(200).required(),
			text: Joi.string().allow(''),
			image_url: Joi.string().allow(''),
			created_at: Joi.date().iso().required(),
			location: Joi.object().required().keys({
				lat: Joi.number().min(-90).max(90).required(),
				lng: Joi.number().min(-180).max(180).required()
			})
		})
	}),
	(req, res, next) => {
		try {
			// First get the card we wish to update
			cards(config, db, logger).byCardId(req.params.cardId)
				.then((card) => {
					// If the card does not exist then return an error message
					if (!card) res.status(404).json({ statusCode: 404, cardId: req.params.cardId, message: `No card exists with id '${req.params.cardId}'` })
					// If the card already has received status then return an error message
					else if (card && card.received) res.status(409).json({ statusCode: 409, cardId: req.params.cardId, message: `Report already received for card '${req.params.cardId}'` })
					// We have a card and it has not yet had a report received
					else {
						// Try and submit the report and update the card
						cards(config, db, logger).submitReport(card, req.body)
							.then((data) => {
								console.log(data)
								res.status(200).json({ statusCode: 200, cardId: req.params.cardId, created: true })
							})
							.catch((err) => {
								logger.error(err);
								next(err);
							})
					}
				})
			} catch(err) {
				logger.error(err);
				next(err);
			}
		}
	);

	return api;
}
