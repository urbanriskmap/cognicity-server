const test = require('unit.js');

export default function (app, reportid){
  // Reports endpoint
  describe('Reports endpoint', function() {
    // Can get reports
    it('Get all reports (GET /reports)', function(done){
        test.httpAgent(app)
          .get('/reports')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            }
            else {
              done();
            }
         });
      });

    // Can get reports by city
    it('Get reports by city /reports?city=jbd', function(done){
        test.httpAgent(app)
          .get('/reports?city=jbd')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            }
            else {
              done();
            }
         });
      });

    // Catch report by city error
    it('Get reports by city /reports?city=xxx', function(done){
        test.httpAgent(app)
          .get('/reports?city=xxx')
          .expect(400)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            }
            else {
              done();
            }
         });
      });

      // Can get reports
      it('Has a get all reports/:id endpoint (GET /reports/:id)', function(done){
          test.httpAgent(app)
            .get('/reports/'+reportid)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res){
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              }
              else {
                done();
              }
           });
        });
   });
}
