const test = require('unit.js');

export default function (app){
  describe('Top level API endpoint', function(){
    it('Gets current API version', function(done){
      test.httpAgent(app)
        .get('/')
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

    it('Can handle unknown routes', function(done){
      test.httpAgent(app)
        .get('/moon')
        .expect(404)
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
