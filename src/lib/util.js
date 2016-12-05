// Import dependencies
import Promise from 'bluebird';
import jwt from 'express-jwt';
import dbgeo from 'dbgeo';

// Import config
import config from '../config';

// Configure our JWT checker TODO: Add expiry check
const jwtCheck = jwt({
  secret: new Buffer(config.AUTH0_SECRET, 'base64'),
  audience: config.AUTH0_CLIENT_ID
});

// TODO Make configurable
dbgeo.defaults = {
  outputFormat: config.GEO_FORMAT_DEFAULT,
  geometryColumn: 'the_geom',
  geometryType: 'wkb',
  precision: config.GEO_PRECISION
}

const formatResponse = (body, outputFormat) => new Promise((resolve, reject) => {
	dbgeo.parse(body, { outputFormat }, (err, formatted) => {
		if (err) reject(err);
		resolve(formatted);
	})
})

// Handle the response, send back a correctly formatted json object with status 200
// Catch and forward any errors in the process
const handleResponse = (data, req, res, next) => {
  console.log(data);
  if (!data || data instanceof Array && data.length === 0)
    res.status(200).json([])
  else
    formatResponse(data, req.query.geoFormat).then((formatted) =>
      res.status(200).json(formatted)).catch((err) => next(err))
}

module.exports = {
  formatResponse, handleResponse, jwtCheck
}
