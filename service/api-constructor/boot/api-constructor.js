import {
  executeAction
} from '../controllers/defaultController';

export default function (app, {prefix}) {
  return new Promise(resolve => {
    Object.keys(app.service).forEach(serviceName => {
      let service = app.service[serviceName];
      if (service.db) {
        Object.keys(service.db).forEach(dbName => {
          let db = service.db[dbName];
          Object.keys(db).forEach(modelName => {
            if (modelName !== 'instance') {
              // let model = db[modelName];
              let url = `${prefix}/:service(${serviceName})?/:model(${modelName})?`.toLowerCase();

              app.get(url, (req, res, next) => {
                executeAction(req, res, next, service, app);
              });
              app.post(url, (req, res, next) => {
                executeAction(req, res, next, service, app);
              });
              app.get(url + '/:hashId', (req, res, next) => {
                executeAction(req, res, next, service, app);
              });
              app.put(url + '/:hashId', (req, res, next) => {
                executeAction(req, res, next, service, app);
              });
              app.delete(url + '/:hashId', (req, res, next) => {
                executeAction(req, res, next, service, app);
              });
            }
          });
        });
      }
    });

    setTimeout(resolve, 1000);
  });
}
