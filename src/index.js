// Import express and http
import express from 'express';
import http from 'http';

// Import express middlewares
import bodyParser from 'body-parser';
import cors from 'cors';
import responseTime from 'response-time';
// TODO: Caching
// TODO: Logging
// TODO: Express Logging
// TODO: Validation
// TODO: Compression

// Import custom middlewares
import middleware from './middleware';

// Import config
import config from './config';

// Setup the DB connection
import initializeDb from './db';

// Import the route api
import api from './api';

// Create the server
let app = express();
app.server = http.createServer(app);

// Provide CORS support (not required if behind API gateway)
config.CORS && app.use(cors({ exposedHeaders: config.CORS_HEADERS }));

// Provide response time header in response
config.RESPONSE_TIME && app.use(responseTime());

// Parse body messages into json
app.use(bodyParser.json({ limit : config.BODY_LIMIT }));

// Connect to db
initializeDb( db => {

	// Apply custom middleware
	app.use(middleware({ config, db }));

	// TODO: Handle authorisation errors elegantly
	app.use((err, req, res, next) => {
	  if (err.name === 'UnauthorizedError') {
	    res.status(401).json({ error: 'Invalid Token' })
	  }
	});

	// Mount the api
	app.use('/', api({ config, db }));

	// Start listening!
	app.server.listen(config.PORT);
	console.log(`Started on port ${app.server.address().port}`);
});

export default app;
