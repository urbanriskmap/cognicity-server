import Promise from 'bluebird';

export default (db, logger) => ({

	allByType: (type) => new Promise((resolve, reject) => {
		let sql = `select name, the_geom from infrastructure.${type}`;
		logger.debug(sql);
		db.any(sql)
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})

});
