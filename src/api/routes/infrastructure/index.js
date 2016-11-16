import resource from 'resource-router-middleware';
import infrastrcture from './model';

export default ({ config, db }) => resource({

	/** Property name to store preloaded entity on `request`. */
	id : 'infrastructure',

	/** For requests with an `id`, you can auto-load the entity.
	 *  Errors terminate the request, success sets `req[id] = data`.
	 */
	load(req, id, callback) {
		let infrastructure = infrastructure.find( infrastructure => infrastructure.id === id ),
			err = infrastructure ? null : 'Not found';
		callback(err, infrastructure);
	},

	/** GET / - List all infrastructure */
	index({ params }, res) {
		res.json(infrastructure);
	},

});
