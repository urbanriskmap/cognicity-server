import { Router } from 'express';

// Import our data model
import cards from './model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse, handleResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';


export default ({ config, db, logger }) => {
	let api = Router();

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
			params: { cardId: Joi.string().required() }
		}),
		(req, res, next) => cards(config, db, logger).byCardId(req.params.cardId)
			.then((data) => handleResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	// Update a card record
	api.put('/:cardId',
		validate({
			params: { cardId: Joi.string().min(7).max(14).required() },
			body: Joi.object().keys({
				water_depth: Joi.number().integer().min(0).max(200).required(),
				text: Joi.string(),
				image_id: Joi.string(),
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
					if (!card) res.status(404).json({ message: `No card exists with id '${req.params.cardId}'` })
					// If the card already has received status then return an error message
					else if (card && card.received) res.status(409).json({ message: `Report already received for card '${req.params.cardId}'` })
					// We have a card and it has not yet had a report received
					else {
						// Try and submit the report and update the card
						cards(config, db, logger).submitReport(card, req.body)
							.then((data) => {
								console.log(data)
								res.status(200).json({ card_id: req.params.card_id, created: true })
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
	// https://github.com/dylang/shortid

	// TODO: Send images to S3, lambda function,
	// api.post('/:cardId/image' - can we upload the card and image at the same time? POST / PUT / PATCH?
	// Validate the card ID, image: png/jpg/gif, max size?
	// API Gateway - binary data
	// Save the file to the bucket, what is the format, filename as report card (check Matthew's code)
	// Send a response back to the user

	return api;
}
