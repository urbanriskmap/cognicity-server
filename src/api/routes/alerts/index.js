/**
* CogniCity Server /alerts endpoint
* @module src/api/alerts/index
**/
import {Router} from 'express';

// Import our data model
import alerts from './model';

// Import any required utility functions
import {cacheResponse, handleGeoResponse} from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

/**
 * Methods to get current alert objects from database
 * @alias module:src/api/reports/index
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} api Express router object for reports route
 */
export default ({config, db, logger}) => {
	let api = Router(); // eslint-disable-line new-cap

	// Get alert objects by user
	api.get('/', cacheResponse('1 minute'),
		validate({
			query: {
				username: Joi.string().required(),
				network: Joi.any().valid(config.SOCIAL_NETWORKS).required(),
        format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
        geoformat: Joi.any().valid(config.GEO_FORMATS)
          .default(config.GEO_FORMAT_DEFAULT),
			},
		}),
		(req, res, next) => alerts(config, db, logger)
													.byUser(req.query.username, req.query.network)
			.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				/* istanbul ignore next */
				logger.error(err);
				/* istanbul ignore next */
				next(err);
			})
	);

  // Create an alert objects for a user
  api.post('/',
    validate({
      body: Joi.object().keys({
          username: Joi.string().required(),
          network: Joi.any().valid(config.SOCIAL_NETWORKS).required(),
          language: Joi.string().valid(config.LANGUAGES).required(),
          location: Joi.object().required().keys({
            lat: Joi.number().min(-90).max(90).required(),
            lng: Joi.number().min(-180).max(180).required(),
          }),
        }),
    }),
    (req, res, next) => alerts(config, db, logger)
                          .create(req.body)
      .then((data) => data ? res.status(200)
      .json({created: true, userkey:data.userkey, location_key:data.location_key}) :
      next(new Error('Failed to register alert')))
      .catch((err) => {
        /* istanbul ignore next */
        logger.error(err);
        /* istanbul ignore next */
        next(err);
      })
  );

	return api;
};
