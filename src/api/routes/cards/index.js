import { Router } from 'express';

// Import our data model
import cards from './model';

// Import any required utility functions
import { handleResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';


export default ({ config, db, logger }) => {
	let api = Router();

	// Check for the existence of a card
	api.head('/:cardId', validate({ params: { cardId: Joi.string().required() } }),
		(req, res, next) => cards(config, db, logger).byCardId(req.params.cardId)
			.then((data) => data ? res.status(200).end() : res.status(404).end())
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	// Return a card
	api.get('/:cardId', validate({ params: { cardId: Joi.string().required() } }),
		(req, res, next) => cards(config, db, logger).byCardId(req.params.cardId)
			.then((data) => handleResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	// Update a card record
	// TODO: Check what is mandatory
	// TODO: Check format for lat / lng - nested object might be nicer than WKT?
	api.put('/:cardId', validate({
		params: { cardId: Joi.string().required() },
		body: Joi.object().keys({
				location: Joi.object().required().keys({
				lat: Joi.number().min(-90).max(90),
				lng: Joi.number().min(-180).max(180)
			}),
			water_depth: Joi.number(), // TODO: Validation?
			text: Joi.string().required(),
			image_id: Joi.string(),
			created_at: Joi.string() // TODO: Data type?
		})
	}),
	(req, res, next) => {
		try {
			// First get the card we wish to update
			cards(config, db, logger).byCardId(req.params.cardId)
				.then((card) => {
					// If the card does not exist then return an error message
					if (!card) res.status(404).json({ message: `No card exists with id '${req.params.cardId}'` })
					// If the card already has received status then return an error message
					// TODO: what is the message here?  HTTP Status 409 seems most appropriate?
					else if (card && card.received) res.status(409).json({ message: `Report already received for card '${req.params.cardId}'` })
					// We have a card and it has not yet had a report received
					else {
						// Try and submit the report and update the card
						cards(config, db, logger).submitReport(card, req.body)
							.then((data) => {
								console.log(data)
								res.status(200).json({ message: 'It works!' })
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

	// TODO: Add POST method to create a new card entry and return the ID

	return api;
}
