## cognicity-server-v3
API Server for Cognicity

This is the NodeJS server which runs the Cognicity API used by the petabencana.id site.  ES6 Support is provided by Babel.

**To Do**
- Full README.md documentation to follow


### Configuration
Server configuration parameters are stored in a configuration file which is parsed by index.js on startup. See config.js for full details example configuration. It is possible to run multiple server instances using different configuration files so long as a unique port is assigned to each instance.  For local development it is recommended that a `.env` file be created in the root directory rather than editing the config.js file directly - this file is specific to your local installation and is deliberately excluded from git to avoid checking sensitive information into Github.  A sample file has been provided, just rename this from sample.env to .env and edit the contents and you are good to go.  Any variable not defined in .env will pickup the default value below (also see config.js)—note that local environment variables will override both .env and config.js.  The following environment variables are currently supported:

* `APP_NAME`: Name of the application (default: `cognicity-server`)
* `AUTH0_CLIENT_ID`: Auth0 client ID (NOTE: this is mandatory and no default value)
* `AUTH0_SECRET`: Auth0 secret (NOTE: this is mandatory and no default value)
* `BODY_LIMIT`: Maximum body size POST/PUT/PATCH (default: `100kb`)
* `CACHE`: Should caching be enabled? (default: `false`)
* `CACHE_DURATION_CARDS`: How long should cards be cached for? (default: '1 minute')
* `CACHE_DURATION_FLOODS`: How long should floods be cached for? (default: '1 hour')
* `CACHE_DURATION_FLOODS_STATES`: How long should flood states be cached for? (default: '1 hour')
* `CACHE_DURATION_INFRASTRUCTURE`: How long should infrastructure be cached for? (default: '1 hour')
* `COMPRESS`: Should the server gzip compress results? (default: `false`)
* `CORS`: Should Cross Object Resource Sharing (CORS) be enabled (default: `false`)
* `CORS_HEADERS`: CORS headers to use (default: `[Link]`)
* `DB_HOSTNAME`: Postgres DB hostname (default: `127.0.0.1`)
* `DB_NAME`: Postgres DB database name (default: `cognicity`)
* `DB_PASSWORD`: Postgres DB password (default: `p@ssw0rd`)
* `DB_PORT`: Postgres DB port (default: `5432`)
* `DB_SSL`: SSL enabled on Postgres DB connection? (default: `false`)
* `DB_TIMEOUT`: Max duration on DB calls before timeout (in milliseconds) (default: `5000` i.e. 5 seconds)
* `DB_USERNAME`: Postgres DB username (default: `postgres`)
* `FORMAT_DEFAULT`: Which format to return results in by default (default: `json`)
* `FORMATS`: Formats supported by the system (as comma separated list) (default: `json,xml`)
* `GEO_FORMAT_DEFAULT`: Which format to return geographic results in by default (default: `topojson`)
* `GEO_FORMATS`: Geographic formats supported by the system (as comma separated list) (default: `topojson,geojson,cap`)
* `GEO_PRECISION`: Precision to use when rounding geographic coordinates (default: `10`)
* `INFRASTRUCTURE_TYPES`: Infrastructure types supported (as comma separated list) (default: `floodgates,pumps,waterways`)
* `LOG_CONSOLE`: In development mode we log to the console by default, in other environments this must be enabled if required by setting this parameter to `true` (default: `false`)
* `LOG_DIR`: Which directory should logs be written to.  If blank, not supplied or the directory is not writable by the application this will default to the current directory
* `LOG_JSON`: Should json format be used for logging (default: `false`)
* `LOG_LEVEL`: What level to log at. Levels are: `silly`, `debug`, `verbose`, `info`, `warn`, `error`. `debug` level is recommended for development.  (default: `error`)
* `LOG_MAX_FILE_SIZE`: Maximum size of log file in bytes before rotating (default: `1024 * 1024 * 100` i.e. `100mb`)
* `LOG_MAX_FILES`: Maximum number of log files before rotation (default: `10`)
* `NODE_ENV`: Which environment are we in.  Environments are: development, test, staging, production (default: `development`)
* `PORT`: Which port should the application run on (default: `8001`)
* `REGION_CODES`: Which region codes are supported (as comma separated list) (default: `jbd,bdg,sby`)
* `RESPONSE_TIME`: Should the server return an `X-Response-Time` header detailing the time taken to process the request.  This is useful for both development to identify latency impact on testing and production for performance / health monitoring (default: `false`)
* `SECURE_AUTH0`: Whether Auth0 JWT token security should be applied to secure routes (default: `false`)

A few points to note on config:

* AWS Beanstalk: If you're deploying to [AWS Elastic Beanstalk](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html) you will need to configure environment variables for each of the above under Configuration -> Software configuration.


### Building
Run `npm run -s build` to build.


### Development
Run `npm run dev` to start the development server for local testing.

### API Notes
Full API documentation at https://docs.petabencana.id, here are notes specifically related to development
- dbgeo expects time stamps from database to be in UTC (i.e. not a local timezone)
