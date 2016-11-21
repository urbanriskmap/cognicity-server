// Import dependencies
import Promise from 'bluebird';
import { middleware as apicache } from 'apicache';
import jwt from 'express-jwt';
import dbgeo from 'dbgeo';

// Import config
import config from '../config';

// If caching is enabled then hand off to apicache otherwise return an empty middleware
const cache = (duration) => {
	return config.CACHE ? apicache(duration) : (req, res, next) => next();
}

// Configure our JWT checker TODO: Add expiry check
const jwtCheck = jwt({
  secret: new Buffer(config.AUTH0_SECRET, 'base64'),
  audience: config.AUTH0_CLIENT_ID
});

// TODO Make configurable
dbgeo.defaults = {
  outputFormat: 'topojson',
  geometryColumn: 'the_geom',
  geometryType: 'wkb',
  precision: null
}

const toGeoJson = (json, options) => new Promise((resolve, reject) => {
	// TODO: use options
	dbgeo.parse(json, options, (err, geojson) => {
		if (err) reject(err);
		resolve(geojson);
	})
})

module.exports = {
  cache, jwtCheck, toGeoJson,
}
