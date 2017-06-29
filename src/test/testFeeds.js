const test = require('unit.js');

export default function(app) {
  // Feeds endpoint
  describe('Feeds endpoint', function() {
    // Can post to qlue
    it('Return 200 for post to feeds/qlue', function(done) {
        test.httpAgent(app)
          .post('/feeds/qlue')
          .send({
              'post_id': '9999',
              'created_at': '2017-06-07T14:32+0700',
              'qlue_city': 'surabaya',
              'disaster_type': 'flood',
              'text': 'test report',
              'location': {
                'lat': 45,
                'lng': 45,
              },
          })
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

    // Catch duplicate post to qlue
    it('Catch duplicate entry to feeds/qlue', function(done) {
        test.httpAgent(app)
          .post('/feeds/qlue')
          .send({
              'post_id': '9999',
              'created_at': '2017-06-07T14:32+0700',
              'qlue_city': 'surabaya',
              'disaster_type': 'flood',
              'text': 'test report',
              'location': {
                'lat': 45,
                'lng': 45,
              },
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              test.value(res.body.created).is(false);
              done();
            }
         });
      });

    // Can post to detik
    it('Return 200 for post to feeds/detik', function(done) {
        test.httpAgent(app)
          .post('/feeds/detik')
          .send({
              'contribution_id': '9999',
              'created_at': '2017-06-07T14:32+0700',
              'disaster_type': 'flood',
              'location': {
                'latitude': 45,
                'longitude': 45,
              },
              'text': 'test report',
          })
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

      // Catch duplicate post to detik
      it('Return 200 for post to feeds/detik', function(done) {
          test.httpAgent(app)
            .post('/feeds/detik')
            .send({
                'contribution_id': '9999',
                'created_at': '2017-06-07T14:32+0700',
                'disaster_type': 'flood',
                'location': {
                  'latitude': 45,
                  'longitude': 45,
                },
                'text': 'test report',
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              } else {
                test.value(res.body.created).is(false);
                done();
              }
           });
        });
  });
}
