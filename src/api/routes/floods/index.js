import { Router } from 'express';

// Import our data model
import floods from './model';

// Import any required utility functions
import { cache, toGeoJson } from '../../../lib/util';

// Setup validation
import Joi from 'joi';
import validate from 'celebrate';

const schema =  {
  query: {
    //token: Joi.string().token().required()
  }
}

export default ({ db, logger }) => {
	let api = Router();

	// Mount the various endpoints
	api.get('/', validate(schema), cache('1 minute'), (req, res, next) => floods(db).all()
		.then((json) => {
      // TODO: CAP (XML) support
			toGeoJson(json).then((geojson) => res.json(geojson)).catch((err) => next(err))
		})
		.catch((err) => {
			logger.error(err);
			next(err);
		})
  );

	return api;
}
