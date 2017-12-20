/**
 * CogniCity Server /reports endpoint
 * @module src/api/reports/index
 **/
 import {Router} from 'express';

// Import our data model
import reports from './model';

// Import child routes
import archive from './archive';
import timeseries from './timeseries';

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

  // child routes before /:id
  api.use('/archive', archive({config, db, logger}));
  api.use('/timeseries', timeseries({config, db, logger}));

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

  api.patch('/:id', validate({
    params: {id: Joi.number().integer().required()},
    body: Joi.object().keys({
      points: Joi.number().valid([-1, 1]).required(),
    }),
  }),
  (req, res, next) => {
      reports(config, db, logger).addPoint(req.params.id, req.body)
        .then((data) => data ? res.status(200)
          .json({statusCode: 200, id: req.params.id, points: data.points}) :
          res.status(404).json(
            {statusCode: 404, message: 'Report id ' + req.params.id
              + ' not found'}).end())
        .catch((err) => {
          /* istanbul ignore next */
          logger.error(err);
          /* istanbul ignore next */
          next(err);
        });
      }
  );

  return api;
};
