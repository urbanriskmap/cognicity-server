/**
 * CogniCity Server /floods timeseries endpoint
 * @module src/api/floods/timeseries/index
 **/
import {Router} from 'express';

// Import our data model
import timeseries from './model';

// Import any required utility functions
import {cacheResponse} from '../../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);
import validate from 'celebrate';

/**
 * Endpoint specification for floods timeseries data
 * @alias module:src/api/floods/timeseries/index
 * @param {Object} config Server configuration
 * @param {Object} db PG Promise database instance
 * @param {Object} logger Configured Winston logger instance
 * @return {Object} api Express router object for route
 */
export default ({config, db, logger}) => {
  let api = Router(); // eslint-disable-line new-cap
  // TODO add support for multiple cities
  // Just get the states without the geographic boundaries
  api.get('/', cacheResponse('1 minute'),
    validate({
      query: {
        start: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ').required(),
        end: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ')
          .min(Joi.ref('start')).required(),
        city: Joi.alternatives().try(Joi.string(),
        Joi.any().valid(null)).default(null, 'city'),
      },
    }),
    (req, res, next) => {
      // validate the time window, if fails send 400 error
      let maxWindow = new Date(req.query.start).getTime() +
      (config.API_REPORTS_TIME_WINDOW_MAX * 1000);
      let end = new Date(req.query.end);
      if (end > maxWindow) {
        res.status(400).json({'statusCode': 400, 'error': 'Bad Request',
          'message': 'child \'end\' fails because [end is more than '
          + config.API_REPORTS_TIME_WINDOW_MAX
          + ' seconds greater than \'start\']',
        'validation': {
          'source': 'query',
          'keys': [
            'end',
        ]}});
        return;
      }

      timeseries(config, db, logger)
      .count(req.query.start, req.query.end, req.query.city)
        .then((data) => res.status(200).json({statusCode: 200, result: data}))
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
