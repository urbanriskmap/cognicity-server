/**
 * CogniCity Server Data API
 * @module src/api/index
 **/
import {Router} from 'express';

// Import the dependencies we need to handle the request
import errorHandler from 'api-error-handler';

// Import validation dependencies
import validate from 'celebrate';

// Import JWT handler
import jwtDecode from 'jwt-decode';

// Get the current version
import {version} from '../../package.json';

// Import our routes
import cards from './routes/cards';
import cities from './routes/cities';
import feeds from './routes/feeds';
import floodgauges from './routes/floodgauges';
import floods from './routes/floods';
import infrastructure from './routes/infrastructure';
import reports from './routes/reports';

/**
* Build CogniCity Server Data API
* @alias module:src/api/index
* @param {Object} config Server configuration
* @param {Object} db PG Promise database instance
* @param {Object} logger Configured Winston logger instance
* @return {Object} api Express router object for API routes
**/
export default ({config, db, logger}) => {
  let api = Router(); // eslint-disable-line new-cap

  // Return the API version
  api.get('/', (req, res) => {
    //console.log(req['context']); // eslint-disable-line no-console
    //console.log(req['headers']); // eslint-disable-line no-console
    console.log(jwtDecode(req['headers']['Authorization']));

    let query = `SELECT * FROM cognicity.version()`;
    db.oneOrNone(query)
      .then((data) => {
        res.status(200).json({version, schema: data.version});
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  });

  // Mount the various endpoints
  // api.use('/areas', cards({ config, db, logger }));// TODO: local_areas
  api.use('/cards', cards({config, db, logger}));
  api.use('/cities', cities({config, db, logger}));
  api.use('/feeds', feeds({config, db, logger}));
  api.use('/floodgauges', floodgauges({config, db, logger}));
  api.use('/floods', floods({config, db, logger}));
  api.use('/infrastructure', infrastructure({config, db, logger}));
  api.use('/reports', reports({config, db, logger}));

  // Handle validation errors (wording can be overridden using err.isJoi)
  api.use(validate.errors());

  // Handle not found errors
  api.use((req, res) => {
    res.status(404).json({message: 'URL not found', url: req.url});
  });

  // Handle errors gracefully returning nicely formatted json
  api.use(errorHandler());

  return api;
};
