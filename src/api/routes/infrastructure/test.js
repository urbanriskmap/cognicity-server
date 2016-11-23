'use strict'

const request = require('supertest');

const app = require('../../../index.js');

console.log(app)


const api = app.server;

console.log(api)

describe('GET /infrastructure', () => {
  it('respond with json', function(done) {
    request(api)
      .get('/infrastructure')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});


/*TODO: Get ES6 and mocha working together
const request = require('supertest');

const api = require('../../../index.js');

describe('GET /reports', () => {
  it('respond with json', function(done) {
    request(api)
      .get('/reports')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
})*/
