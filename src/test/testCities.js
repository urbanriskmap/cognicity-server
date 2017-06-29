const test = require('unit.js');

export default function(app) {
  // Cities endpoint
  describe('Cities endpoint', function() {
    // Can get cities
    it('Return 200 for cities list', function(done) {
        test.httpAgent(app)
          .get('/cities')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      });
  });
}
