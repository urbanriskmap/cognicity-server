// Import dependencies
import Promise from 'bluebird';
import jwt from 'express-jwt';
import dbgeo from 'dbgeo';

// Import config
import config from '../config';

// Caching
import apicache from 'apicache';
apicache.options({ debug: config.LOG_LEVEL === 'debug', statusCodes: { include: [200] } })
let cache = apicache.middleware;

// Cache response if enabled
const cacheResponse = (duration) => cache(duration, config.CACHE);

// Configure our JWT checker
const checkToken = jwt({
  secret: new Buffer(config.AUTH0_SECRET, 'base64'),
  audience: config.AUTH0_CLIENT_ID
});

// Setup dbgeo
dbgeo.defaults = {
  outputFormat: config.GEO_FORMAT_DEFAULT,
  geometryColumn: 'the_geom',
  geometryType: 'wkb',
  precision: config.GEO_PRECISION
}

// Format the geographic response with the required geo format
const formatResponse = (body, outputFormat) => new Promise((resolve, reject) => {
	dbgeo.parse(body, { outputFormat }, (err, formatted) => {
		if (err) reject(err);
		resolve(formatted);
	})
})

// Handle the response, send back a correctly formatted json object with status 200 or not found 404
// Catch and forward any errors in the process
const handleResponse = (data, req, res, next) => {
  if (!data) {
    // If no data then return a not found error
    res.status(404).json({ statusCode: 404, found: false, result: null })
  } else if (data instanceof Array) {
    if (req.query.geoformat) {
      // Format with requested geoformat
      formatResponse(data, req.query.geoformat)
        .then((formatted) => res.status(200).json({ statusCode: 200, result: formatted }))
        .catch((err) => next(err))
    } else {
      // Send results as they are
      res.status(200).json({ statusCode: 200, result: data })
    }
  } else {
    // Send results as they are
    res.status(200).json({ statusCode: 200, found: true, result: data })
  }
}

module.exports = {
  cacheResponse, checkToken, formatResponse, handleResponse
}
