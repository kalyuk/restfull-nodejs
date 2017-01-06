import Umzug from 'umzug';
import path from 'path';
import series from 'async/series';

export default function (app) {
  let promises = [];
  Object.keys(app.service).forEach(serviceName => {
    if (app.service[serviceName].db) {
      Object.keys(app.service[serviceName].db).forEach(dbName => {
        let db = app.service[serviceName].db[dbName];

        promises.push((callback) => {

          let umzug = new Umzug({
            storage: 'sequelize',
            storageOptions: {
              logging: true,
              sequelize: db.instance
            },
            migrations: {
              params: [db, db.instance.getQueryInterface(), db.instance.constructor, function () {
                throw new Error('Migration tried to use old style "done" callback. ' +
                  'Please upgrade to "umzug" and return a promise instead.');
              }],
              path: path.join(__dirname, '..', 'service', serviceName, 'models', dbName, 'migrations')
            }
          });

          let migration = umzug.up();

          migration.catch(err => {
            callback(err);
          });

          migration.then(() => {
            callback();
          });
        });
      });
    }
  });

  return new Promise(resolve => {
    series(promises, (err) => {
      if (err) {
        console.log('===>', err); // eslint-disable-line no-console
      } else {
        resolve();
      }
    });
  });
}
