import Promise from 'bluebird';

export default (db, logger) => ({

	all: () => new Promise((resolve, reject) => {
		let sql = `select * from cognicity.all_reports`;
		logger.debug(sql);
		db.any(sql)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})

});
