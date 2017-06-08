const test = require('unit.js');

export default function (app){

// Floods endpoint
describe('Flood areas endpoint', function(){
    // Test put flood auth
    it ('Catch bad auth for put a flood (PUT /floods/:id)', function(done){
      test.httpAgent(app)
        .put('/floods/5')
        .send({
            "state": "2"
        })
        .expect(401)
        .expect('Content-Type', /json/)
        .end(function(err, res){
          if (err){
            test.fail(err.message + ' ' + JSON.stringify(res));
          }
          else {
            done();
          }
        });
    });

    // Test delete flood auth
    it ('Catch bad auth for put a flood (PUT /floods/:id)', function(done){
      test.httpAgent(app)
        .delete('/floods/5')
        .send({
            "username": "testing"
        })
        .expect(401)
        .expect('Content-Type', /json/)
        .end(function(err, res){
          if (err){
            test.fail(err.message + ' ' + JSON.stringify(res));
          }
          else {
            done();
          }
        });
    });

    // Get floods
    it('Get floods (GET /floods)', function(done){
      this.timeout(15000); // a lot of data is returned
        test.httpAgent(app)
          .get('/floods')
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

      // Get floods
      it('Get floods in geojson (GET /floods?format=json&geoformat=geojson)', function(done){
        this.timeout(15000); // a lot of data is returned
          test.httpAgent(app)
            .get('/floods/?format=json&geoformat=geojson')
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

    // Can get reports in CAP format
    it('Get all reports in CAP format (GET /floods?geoformat=cap)', function(done){
      this.timeout(15000); // a lot of data is returned
        test.httpAgent(app)
          .get('/floods?format=xml&geoformat=cap')
          .expect(200)
          .expect('Content-Type', /text/)
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
