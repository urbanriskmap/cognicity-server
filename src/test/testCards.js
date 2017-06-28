const test = require('unit.js');

export default function (app){
  // Cards endpoint
  describe('Cards endpoint', function() {
    // Cards
    it('Return 404 if card requested without ID (GET /cards)', function(done){
        test.httpAgent(app)
          .get('/cards')
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

    // Can get reports
    it('Return 400 if card requested with wrong ID (GET /cards/:id)', function(done){
        test.httpAgent(app)
          .get('/cards/1')
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
   });

   // Cards end to end test
   describe('End-to-end card test', function() {

     let cardId = '0';

     // Request a card, submit and get resulting card details
     it('Get card one time link', function(done){
         test.httpAgent(app)
           .post('/cards')
           .send({
               "username": "testuser",
               "network": "test network",
               "language": "en"
           })
           .expect(200)
           .expect('Content-Type', /json/)
           .end(function(err, res){
             if (err) {
               test.fail(err.message + ' ' + JSON.stringify(res));
             }
             else {
               cardId = res.body.cardId
               test.value(res.body.created).is(true);
               done();
             }
          });
       });

       // Check HEAD request on cardId
       it('Check HEAD request on cardId', function(done){
           test.httpAgent(app)
             .head('/cards/'+cardId)
             .expect(200)
             .end(function(err, res){
               if (err) {
                 test.fail(err.message + ' ' + JSON.stringify(res));
               }
               else {
                 done();
               }
            });
         });

       // Request a card, submit and get resulting report
       it('Put card data', function(done){
           test.httpAgent(app)
             .put('/cards/'+cardId)
             .send({
                 "disaster_type":"flood",
                 "card_data":{
                   "flood_depth": 20,
                   "report_type": "flood"
                 },
                 "text": "integration testing",
                 "created_at": "2017-06-07T07:00:00+0700",
                 "location": {
                   "lat": -6.4,
                   "lng": 106.6
                 }
             })
             .expect(200)
             .expect('Content-Type', /json/)
             .end(function(err, res){
               if (err) {
                 test.fail(err.message + ' ' + JSON.stringify(res));
               }
               else {
                 console.log(res.body);
                 done();
               }
            });
         });

         // Get signed URL for card image
         it('Get card image link', function(done){
            this.timeout(15000); // nested call
             test.httpAgent(app)
               .get('/cards/'+cardId+'/images')
               .expect(200)
               .end(function(err, res){
                 if (err) {
                   test.fail(err.message + ' ' + JSON.stringify(res));
                 }
                 else {
                   console.log(res.body);
                   done();
                 }
              });
           });

         // Request a card, submit and get resulting report
         it('Get card data', function(done){
             test.httpAgent(app)
               .get('/cards/'+cardId)
               .expect(200)
               .expect('Content-Type', /json/)
               .end(function(err, res){
                 if (err) {
                   test.fail(err.message + ' ' + JSON.stringify(res));
                 }
                 else {
                   test.value(res.body.result.card_id).is(cardId);
                   test.value(res.body.result.username).is('testuser');
                   test.value(res.body.result.network).is('test network')
                   test.value(res.body.result.language).is('en')
                   test.value(res.body.result.report.text).is('integration testing')
                   done();
                 }
              });
           });

           // Update a card
           it('Update card data', function(done){
               test.httpAgent(app)
                 .patch('/cards/'+cardId)
                 .send({
                     "water_depth": 20,
                     "text": "big flood",
                     "image_url": "dummy image url"
                 })
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