import path from 'path';
import Sequelize from 'sequelize';
import glob from 'glob';
import each from 'async/each';

export default function (app) {
  let config = app.get('database');
  let {ENV} = app.options;
  return new Promise(resolve => {
    Object.keys(config).forEach(serviceName => {
      app.service[serviceName].db = {};

      each(Object.keys(config[serviceName][ENV]), (dbName, callback) => {
        app.service[serviceName].db[dbName] = {
          instance: new Sequelize(
            config[serviceName][ENV][dbName].database,
            config[serviceName][ENV][dbName].username,
            config[serviceName][ENV][dbName].password,
            config[serviceName][ENV][dbName].params)
        };

        glob(path.join(__dirname, '..', 'service', serviceName, 'models', '*', '*.js'), (err, files) => {
          files.forEach(file => {
            let model = app.service[serviceName].db[dbName].instance.import(file);
            app.service[serviceName].db[dbName][model.name] = model;
          });

          Object.keys(app.service[serviceName].db[dbName]).forEach(modelName => {
            if ('associate' in app.service[serviceName].db[dbName][modelName]) {
              app.service[serviceName].db[dbName][modelName].associate(app.service[serviceName].db[dbName]);
            }
          });

          callback();
        });
      }, resolve);
    });
  });
}
