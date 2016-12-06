import { Router } from 'express';

// Import the dependencies we need to handle the request
import errorHandler from 'api-error-handler';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Get the current version
import { version } from '../../package.json';

// Import our routes
import cards from './routes/cards';
import feeds from './routes/feeds';
import floodgauges from './routes/floodgauges';
import floods from './routes/floods';
import infrastructure from './routes/infrastructure';
import reports from './routes/reports';

// Import any required utility functions
import { cacheResponse, checkToken } from '../lib/util';


export default ({ config, db, logger }) => {
	let api = Router();

	// Setup any API level general validation rules
	api.use(validate({
		query: {
			city: Joi.any().valid(config.REGION_CODES),
			format: Joi.any().valid(config.FORMATS).default(config.FORMAT_DEFAULT),
			geoFormat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT),
		}
	}));

	// Return the API version
	api.get('/', (req, res) => {
		res.status(200).json({ version });
	});

	// Mount the various endpoints
	api.use('/cards', cards({ config, db, logger }));
	api.use('/feeds', feeds({ config, db, logger }));
	api.use('/floodgauges', floodgauges({ config, db, logger }));
	api.use('/floods', checkToken, floods({ config, db, logger }));
	api.use('/infrastructure', cacheResponse('1 hour'), infrastructure({ config, db, logger }));
	api.use('/reports', reports({ config, db, logger }));

	// Handle validation errors (wording of messages can be overridden using err.isJoi)
	api.use(validate.errors());

	// Handle not found errors
	api.use((req, res) => {
		res.status(404).json({ message: 'URL not found', url: req.url });
	});

	// Handle errors gracefully returning nicely formatted json
	api.use(errorHandler());

	return api;
}
