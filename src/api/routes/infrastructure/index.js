/**
 * CogniCity Server /infrastructure endpoint
 * @module src/api/infrastructure/index
 **/
import {Router} from 'express';

// Import our data model
import infrastructure from './model';

// Import any required utility functions
import {cacheResponse, handleGeoResponse} from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

/**
 * Endpoint specification for infrastructrue data
 * @alias module:src/api/infrastructure/index
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} api Express router object for reports route
 */
export default ({config, db, logger}) => {
  let api = Router(); // eslint-disable-line new-cap

  // Get a list of infrastructure by type for a given city
  api.get('/:type', cacheResponse(config.CACHE_DURATION_INFRASTRUCTURE),
    validate({
      params: {type: Joi.any().valid(config.INFRASTRUCTURE_TYPES)},
      query: {
        city: Joi.any().valid(config.REGION_CODES),
        format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
        geoformat: Joi.any().valid(config.GEO_FORMATS)
                  .default(config.GEO_FORMAT_DEFAULT),
      },
    }),
    (req, res, next) => infrastructure(config, db, logger)
      .all(req.query.city, req.params.type)
      .then((data) => handleGeoResponse(data, req, res, next))
      .catch((err) => {
        /* istanbul ignore next */
        logger.error(err);
        /* istanbul ignore next */
        next(err);
      })
  );

  return api;
};
