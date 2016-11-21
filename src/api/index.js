import { Router } from 'express';

// Import the dependencies we need to handle the request
import errorHandler from 'api-error-handler';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Get the current version
import { version } from '../../package.json';

// Import our routes
import floods from './routes/floods';
import infrastructure from './routes/infrastructure';
import reports from './routes/reports';

export default ({ config, db, logger }) => {
	let api = Router();

	// Setup any API level general validation rules
	api.use(validate({
		query: {
			city: Joi.any().valid(config.REGION_CODES)
		}
	}));

	// Return the API version
	// TODO: Perhaps expose some API metadata?
	api.get('/', (req, res) => {
		res.json({ version });
	});

	// Mount the various endpoints
	api.use('/floods', floods({ config, db, logger }));
	api.use('/infrastructure', infrastructure({ config, db, logger }));
	api.use('/reports', reports({ config, db, logger }));

	// Handle validation errors (wording of messages can be overridden using err.isJoi)
	api.use(validate.errors());

	// Handle errors gracefully returning nicely formatted json
	api.use(errorHandler());

	return api;
}
