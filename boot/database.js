import path from 'path';
import Sequelize from 'sequelize';
import glob from 'glob';
import each from 'async/each';

import Hashids from 'hashids';

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

        glob(path.join(__dirname, '..', 'service', serviceName, 'models', '*', '*.json'), (err, files) => {
          files.forEach(file => {
            let schema = require(file);
            let fn = require(file.replace('.json', '.js'));
            let instance = app.service[serviceName].db[dbName].instance;

            let define = {};

            let options = Object.assign({
              tableName: schema.tableName,
              name: schema.name,
              instanceMethods: {},
              classMethods: {}
            }, fn);

            options.classMethods.acl = {};

            if (schema.acl) {
              options.classMethods.acl = schema.acl;
            }

            Object.keys(schema.properties).forEach(property => {
              let meta = schema.properties[property];
              let type = Sequelize.DataTypes[meta.type.name.toUpperCase()];
              if (meta.type.options) {
                type = type(meta.type.options);
              }
              define[property] = Object.assign({}, {type}, meta.options);
            });

            options.instanceMethods.encode = function (value) {
              return app.service[serviceName].db[dbName][schema.model].hashIds.encode(value);
            };

            options.instanceMethods.decode = function (value) {
              return app.service[serviceName].db[dbName][schema.model].hashIds.decode(value);
            };

            options.instanceMethods.toJSON = function () {
              let values = Object.assign({}, this.get());
              if (schema.hidden) {
                values.hashId = this.encode(values.id);
                delete values.id;
                schema.hidden.forEach(fieldName => {
                  if (values[fieldName]) {
                    delete values[fieldName];
                  }
                });
              }
              return values;
            };
            app.service[serviceName].db[dbName][schema.model] = instance.define(schema.model, define, options);

            let salt = 'm93k' + serviceName + 'd7nsd' + schema.model + 'osdi4' + dbName + '3820d';
            let length = 8;
            let key = 'ABCDEFGHKLMNPRSTUWXYZ1234567890';

            if (config[serviceName][ENV][dbName].hashIds) {
              salt = config[serviceName][ENV][dbName].hashIds.salt;
              length = config[serviceName][ENV][dbName].hashIds.length;
              key = config[serviceName][ENV][dbName].hashIds.key;
            }

            app.service[serviceName].db[dbName][schema.model].hashIds = new Hashids(salt, length, key);
          });

          Object.keys(app.service[serviceName].db[dbName]).forEach(modelName => {
            if (app.service[serviceName].db[dbName][modelName].associate) {
              app.service[serviceName].db[dbName][modelName].associate(app.service[serviceName].db[dbName]);
            }
          });
          callback();
        });
      }, resolve);
    });
  });
}
