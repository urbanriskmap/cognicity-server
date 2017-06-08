import { Router } from 'express';

// Import our data model
import cards from './model';

// Import any required utility functions
import { cacheResponse, handleResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Import ID generator
import shortid from 'shortid';

// Import image upload capabilities
import AWS from 'aws-sdk';
var s3 = new AWS.S3(
  {
    accessKeyId : process.env.accessKeyId || '' ,
    secretAccessKey : process.env.secretAccessKey  || '',
    signatureVersion: 'v4',
    region: 'ap-south-1'
  });



// Caching
import apicache from 'apicache';
const CACHE_GROUP_CARDS = '/cards';

// Function to clear out the cache
const clearCache = () => {
	apicache.clear(CACHE_GROUP_CARDS);
};

export default ({ config, db, logger }) => {
	let api = Router();

	// Create a new card and if successful return generated cardId
	api.post('/',
		validate({
			body: Joi.object().keys({
				username: Joi.string().required(),
				network: Joi.string().required(),
				language: Joi.string().valid(config.LANGUAGES).required()
			})
		}),
		(req, res, next) => {
			let cardId = shortid.generate();
			cards(config, db, logger).create(cardId, req.body)
				.then((data) => data ? res.status(200).json({ cardId: cardId, created: true }) :
					next(new Error('Failed to create card')))
				.catch((err) => {
					logger.error(err);
					next(err);
				});
		}
	);

	// Check for the existence of a card
	api.head('/:cardId', cacheResponse(config.CACHE_DURATION_CARDS),
		validate({
			params: { cardId: Joi.string().required() }
		}),
		(req, res, next) => {
			req.apicacheGroup = CACHE_GROUP_CARDS;
			cards(config, db, logger).byCardId(req.params.cardId)
				.then((data) => data ? res.status(200).end() : res.status(404).end())
				.catch((err) => {
					logger.error(err);
					next(err);
				});
		}
	);

	// Return a card
	api.get('/:cardId', cacheResponse(config.CACHE_DURATION_CARDS),
		validate({
			params: { cardId: Joi.string().min(7).max(14).required() }
		}),
		(req, res, next) => {
			req.apicacheGroup = CACHE_GROUP_CARDS;
			cards(config, db, logger).byCardId(req.params.cardId)
				.then((data) => handleResponse(data, req, res, next))
				.catch((err) => {
					logger.error(err);
					next(err);
				});
		}
	);

	// Update a card record with a report
	api.put('/:cardId', validate({
		params: { cardId: Joi.string().min(7).max(14).required() },
		body: Joi.object().keys({

      water_depth: Joi.number().integer().min(0).max(200).required(),
      /*** TODO - re-enable this new card data structure when PetaBencana.id client-code is ready.
      ... and remove hard-coded water_depth parameter above

      disaster_type: Joi.string().valid(config.DISASTER_TYPES).required(),
      card_data: Joi.object()
        .keys({
            flood_depth: Joi.number(),
            report_type: Joi.string().valid(config.REPORT_TYPES).required()
        })
        .required()
        .when('disaster_type', {
            is: 'flood',
            then: Joi.object({ flood_depth: Joi.number().integer().min(0).max(200).required() })		// b.c is required only when a is true
        }),
      ***/
			text: Joi.string().allow(''),
			image_url: Joi.string().allow(''),
			created_at: Joi.date().iso().required(),
			location: Joi.object().required().keys({
				lat: Joi.number().min(-90).max(90).required(),
				lng: Joi.number().min(-180).max(180).required()
			})
		})
	}),
	(req, res, next) => {
		try {
			// First get the card we wish to update
			cards(config, db, logger).byCardId(req.params.cardId)
				.then((card) => {
					// If the card does not exist then return an error message
					if (!card) res.status(404).json({ statusCode: 404, cardId: req.params.cardId,
						message: `No card exists with id '${req.params.cardId}'` });
					// If the card already has received status then return an error message
					else if (card && card.received) res.status(409).json({ statusCode: 409,
						cardId: req.params.cardId, message: `Report already received for card '${req.params.cardId}'` });
					// We have a card and it has not yet had a report received
					else {
						// Try and submit the report and update the card
						cards(config, db, logger).submitReport(card, req.body)
							.then((data) => {
								console.log(data);
								clearCache();
								res.status(200).json({ statusCode: 200, cardId: req.params.cardId, created: true });
							})
							.catch((err) => {
								logger.error(err);
								next(err);
							});
					}
				});
			} catch(err) {
				logger.error(err);
				next(err);
			}
		}
	);

  //Gives an s3 signed url for the frontend to upload an image to
  api.get('/:cardId/images', validate({
    params: { cardId: Joi.string().min(7).max(14).required() }
  }),
  (req, res, next) => {
    let s3params = {
      Bucket: config.IMAGE_BUCKET,
      Key: 'originals/' + req.params.cardId + ".jpg",
      ContentType:req.query.file_type
    };
    s3.getSignedUrl('putObject', s3params, (err, data) => {
      if (err){
        logger.error('could not get signed url from S3');
        logger.error(err);
      } else {
        var returnData = {
          signedRequest : data,
          url: 'https://s3.'+config.AWS_REGION+'.amazonaws.com/'+ config.IMAGE_BUCKET+'/'+ s3params.Key
        };
        //write the url into the db under image_url for this card

        cards(config, db, logger).byCardId(req.params.cardId)
          .then((card) => {
            if (!card) res.status(404).json({ statusCode: 404, cardId: req.params.cardId,
              message: `No card exists with id '${req.params.cardId}'` })
            else {
              // Try and submit the report and update the card
              cards(config, db, logger).updateReport(card, {image_url: 'https://'+config.IMAGES_HOST+'/'+req.params.cardId+'.jpg' })
              .then((data) => {
                console.log(data);
                clearCache();
                logger.debug( "s3 signed request: " + returnData.signedRequest);
                res.write(JSON.stringify(returnData));
                res.end();
                //res.status(200).json({ statusCode: 200, cardId: req.params.cardId, updated: true });
              })
              .catch((err) => {
                logger.error(err);
                next(err);
              })
            }


          })
      }
    });
  });

	// Update a card report with new details including the image URL
	api.patch('/:cardId', validate({
		params: { cardId: Joi.string().min(7).max(14).required() },
		body: Joi.object().keys({
			water_depth: Joi.number().integer().min(0).max(200),
			text: Joi.string().allow(''),
			image_url: Joi.string()
		})
	}),
	(req, res, next) => {
		try {
			// First get the card we wish to update
			cards(config, db, logger).byCardId(req.params.cardId)
				.then((card) => {
					// If the card does not exist then return an error message
					if (!card) res.status(404).json({ statusCode: 404, cardId: req.params.cardId,
						message: `No card exists with id '${req.params.cardId}'` });
					// We have a card
					else {
						// Try and submit the report and update the card
						cards(config, db, logger).updateReport(card, req.body)
							.then((data) => {
								console.log(data);
								clearCache();
								res.status(200).json({ statusCode: 200, cardId: req.params.cardId, updated: true });
							})
							.catch((err) => {
								logger.error(err);
								next(err);
							});
					}
				});
			} catch(err) {
				logger.error(err);
				next(err);
			}
		}
	);

	return api;
};
