/**
 * testCards module
 * @module src/test/testCards
 * A module to test the /cards endpoint
 */

import * as test from 'unit.js';

/**
 * Test cards endpoint
 * @function testCards
 * @param {Object} app - CogniCity server app object
 * @param {String} createdAt - Sample date as ISO 8601 string
 */
export default function(app, createdAt) {
  // Cards endpoint
  describe('Cards endpoint', function() {
    // Cards 404 error handling
    it('Return 404 if card requested without ID (GET /cards)', function(done) {
        test.httpAgent(app)
          .get('/cards')
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

    // Cards 400 card ID error handling
    it('Return 400 if card ID is invalid (GET /cards/:id)', function(done) {
        test.httpAgent(app)
          .get('/cards/1')
          .expect(400)
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

   // Cards end to end test
   describe('End-to-end card test', function() {
     let cardId = '0';

     // Request a card, submit and get resulting card details
     it('Get card one time link', function(done) {
         test.httpAgent(app)
           .post('/cards')
           .send({
               'username': 'testuser',
               'network': 'test network',
               'language': 'en',
           })
           .expect(200)
           .expect('Content-Type', /json/)
           .end(function(err, res) {
             if (err) {
               test.fail(err.message + ' ' + JSON.stringify(res));
             } else {
               cardId = res.body.cardId;
               test.value(res.body.created).is(true);
               done();
             }
          });
       });

       // Check HEAD request on cardId
       it('Check HEAD request on cardId', function(done) {
           test.httpAgent(app)
             .head('/cards/'+cardId)
             .expect(200)
             .end(function(err, res) {
               if (err) {
                 test.fail(err.message + ' ' + JSON.stringify(res));
               } else {
                 done();
               }
            });
         });

     // Update a card
     it('Try update card image before report submitted', function(done) {
         test.httpAgent(app)
           .patch('/cards/'+cardId)
           .send({
               'image_url': 'image',
           })
           .expect(403)
           .expect('Content-Type', /json/)
           .end(function(err, res) {
             if (err) {
               test.fail(err.message + ' ' + JSON.stringify(res));
             } else {
               done();
             }
          });
       });

       // Request a card, catch time zone error
       it('Put card data', function(done) {
        test.httpAgent(app)
          .put('/cards/'+cardId)
          .send({
              'disaster_type': 'flood',
              'card_data': {
                'flood_depth': 20,
                'report_type': 'flood',
              },
              'text': 'integration testing',
              'created_at': '2017-11-01T00:00',
              'location': {
                'lat': -6.4,
                'lng': 106.6,
              },
          })
          .expect(400)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      });

       // Request a card, submit and get resulting report
       it('Put card data', function(done) {
           test.httpAgent(app)
             .put('/cards/'+cardId)
             .send({
                 'disaster_type': 'flood',
                 'card_data': {
                   'flood_depth': 20,
                   'report_type': 'flood',
                 },
                 'text': 'integration testing',
                 'created_at': createdAt,
                 'location': {
                   'lat': -6.4,
                   'lng': 106.6,
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

         // Get signed URL for card image
         it('Get card image link', (done) => {
             test.httpAgent(app)
               .get('/cards/'+cardId+'/images')
               .set('content-type', 'image/jpeg')
               .expect(200)
               .end(function(err, res) {
                 if (err) {
                   test.fail(err.message + ' ' + JSON.stringify(res));
                 } else {
                   done();
                 }
              });
           }).timeout(150000);

         // Get signed URL for card image
         it('Catch request card image link without content type', (done) => {
             test.httpAgent(app)
               .get('/cards/'+cardId+'/images')
               .expect(400)
               .end(function(err, res) {
                 if (err) {
                   test.fail(err.message + ' ' + JSON.stringify(res));
                 } else {
                   done();
                 }
              });
           }).timeout(150000);

         // Get signed URL for card image
         it('Catch request card image link with non image type', (done) => {
             test.httpAgent(app)
               .get('/cards/'+cardId+'/images')
               .set('content-type', 'audio/mpeg')
               .expect(400)
               .end(function(err, res) {
                 if (err) {
                   test.fail(err.message + ' ' + JSON.stringify(res));
                 } else {
                   done();
                 }
              });
           }).timeout(150000);

         // Request a card and get resulting report
         it('Get card data', function(done) {
             test.httpAgent(app)
               .get('/cards/'+cardId)
               .expect(200)
               .expect('Content-Type', /json/)
               .end(function(err, res) {
                 if (err) {
                   test.fail(err.message + ' ' + JSON.stringify(res));
                 } else {
                   test.value(res.body.result.card_id).is(cardId);
                   test.value(res.body.result.network).is('test network');
                   test.value(res.body.result.language).is('en');
                   test.value(res.body.result.report.text)
                    .is('integration testing');
                   done();
                 }
              });
           });

           // Update a card
           it('Update card data', function(done) {
               test.httpAgent(app)
                 .patch('/cards/'+cardId)
                 .send({
                     'image_url': 'image',
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

             // Request a card and get resulting report with new image
             it('Get card data with new image', function(done) {
                 test.httpAgent(app)
                   .get('/cards/'+cardId)
                   .expect(200)
                   .expect('Content-Type', /json/)
                   .end(function(err, res) {
                     if (err) {
                       test.fail(err.message + ' ' + JSON.stringify(res));
                     } else {
                       test.value(res.body.result.card_id).is(cardId);
                       test.value(res.body.result.network).is('test network');
                       test.value(res.body.result.language).is('en');
                       test.value(res.body.result.report.text)
                        .is('integration testing');
                       test.value(res.body.result.report.image_url)
                        .is('https://images.petabencana.id/image.jpg');
                       done();
                     }
                  });
               });

             // Update a card
             it('Try update card image after image submitted', function(done) {
                 test.httpAgent(app)
                   .patch('/cards/'+cardId)
                   .send({
                       'image_url': 'image',
                   })
                   .expect(403)
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
