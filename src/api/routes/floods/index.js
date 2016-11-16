import resource from 'resource-router-middleware';
import floods from './model';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'floods',

	/** For requests with an `id`, you can auto-load the entity.
	 *  Errors terminate the request, success sets `req[id] = data`.
	 */
	load(req, id, callback) {
		let flood = floods.find( flood => flood.id === id ),
			err = flood ? null : 'Not found';
		callback(err, flood);
	},

	/** GET / - List all infrastructure */
	index({ params }, res) {
		res.json(floods);
	},

});
