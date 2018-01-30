## cognicity-server
API Server for CogniCity

### v3.0.0
* Refactored server just for data API (web content hosted separately)
* Merged REM API functionality into mainline server
* Added authentication to some endpoints using Auth0/JWT
* Added new functionality for data collection using GRASP Cards
* API Documentation moved to dedicated wiki: https://docs.petabencana.id/

### v3.0.1
* Refactored server module for better testability
* Added tests for endpoints using unit.js and mocha
* Added coverage for tests using Istanbull, nyc and coveralls
* Added integration tests on Travis, including against cognicity-schema
* Extended data format of cards data object to collect different types of data
* Merged changes from Chennai deployment, for better deployment in new cities

### v3.0.2
* Updated to use Node v8.1.4 with npm 5.0.3
* Pushed image url assignment to server
* Updated cards/ patch endpoint to stop potential overwriting of image url
* Card IDs generated as UUID by Postgres
* Added schema version to / endpoint
* Image upload changed to use AWS S3 signed links

### v3.0.3
* Added a default expire time to CAP output
* Add /floods/archive endpoint
* Added database log entry for card creation
* Added /floods/timeseries endpoint
* Added /reports/timeseries endpoint
* Added time window check on archive and time series endpoints
* Updated API definitions in swagger file

### v3.0.4
* Added Semarang instance for Indonesian deployment
* Fixed out of date link in README to list of releases

### v3.0.5
* Fixed bug in API (swagger-api.json) for flood archive and timeseries endpoints
* Added PATCH /reports/:id endpoint for "points"
* Updated documentation of Swagger files
* Updated Babel package
* Remove username field from GET /cards/:id
* Fix bug with time series endpoints

### v3.0.6
* Fix but with expiry time in CAP format of floods/ endpoint
