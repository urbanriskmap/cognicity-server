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
