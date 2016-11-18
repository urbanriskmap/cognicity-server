export default (db) => ({

	// TODO: Add implementation code?  e.g JBO etc
	all: () => new Promise((resolve, reject) => {
		db.any(`select * from cognicity.all_reports`)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})

});
