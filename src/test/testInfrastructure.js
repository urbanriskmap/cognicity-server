const test = require('unit.js');

export default function(app) {
  // Infrastructure endpoint
  describe('Infrastructure endpoint', function() {
    // Catch invalid top-level infrastructure endpoint
    it('Return 404 for get /infrastructure', function(done) {
        test.httpAgent(app)
          .get('/infrastructure')
          .expect(404)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      });

      // Return waterways infrastructure
      it('Return 200 for get /infrastructure/waterways', function(done) {
          test.httpAgent(app)
            .get('/infrastructure/waterways')
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
