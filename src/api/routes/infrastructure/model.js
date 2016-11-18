export default (db) => ({

	// TODO: Add implementation code?  e.g JBO etc
	allByType: (type) => new Promise((resolve, reject) => {
		db.any(`select name, the_geom from infrastructure.${type}`)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})

});
