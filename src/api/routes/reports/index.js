/**
 * CogniCity Server /reports endpoint
 * @module src/api/reports/index
 **/
 import {Router} from 'express';

// Import our data model
import reports from './model';

import archive from './archive';

// Import any required utility functions
import {cacheResponse, handleGeoResponse} from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

/**
 * Methods to get current flood reports from database
 * @alias module:src/api/reports/index
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} api Express router object for reports route
 */
export default ({config, db, logger}) => {
  let api = Router(); // eslint-disable-line new-cap

  // Get a list of all reports
  api.get('/', cacheResponse('1 minute'),
    validate({
      query: {
        city: Joi.any().valid(config.REGION_CODES),
        timeperiod: Joi.number().integer().positive()
          .max(config.API_REPORTS_TIME_WINDOW_MAX)
          .default(config.API_REPORTS_TIME_WINDOW),
        format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
        geoformat: Joi.any().valid(config.GEO_FORMATS)
          .default(config.GEO_FORMAT_DEFAULT),
      },
    }),
    (req, res, next) => reports(config, db, logger)
                          .all(req.query.timeperiod, req.query.city)
      .then((data) => handleGeoResponse(data, req, res, next))
      .catch((err) => {
        /* istanbul ignore next */
        logger.error(err);
        /* istanbul ignore next */
        next(err);
      })
  );

  // to get all reports between two dates
  api.use('/archive', archive({config, db, logger}));

  // Get a single report
  api.get('/:id', cacheResponse('1 minute'),
    validate({
      params: {id: Joi.number().integer().required()},
      query: {
        format: Joi.any().valid(config.FORMATS)
          .default(config.FORMAT_DEFAULT),
        geoformat: Joi.any().valid(config.GEO_FORMATS)
          .default(config.GEO_FORMAT_DEFAULT),
      },
    }),
    (req, res, next) => reports(config, db, logger).byId(req.params.id)
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
