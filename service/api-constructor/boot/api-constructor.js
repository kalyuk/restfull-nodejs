import {
  executeAction
} from '../controllers/defaultController';

import {capitalizeFirstLetter} from '../../../helpers/string';

export default function (app, {prefix}) {
  return new Promise(resolve => {
    Object.keys(app.service).forEach(serviceName => {
      let service = app.service[serviceName];
      if (service.db) {
        Object.keys(service.db).forEach(dbName => {
          let db = service.db[dbName];
          Object.keys(db).forEach(modelName => {
            if (modelName !== 'instance' &&  db[modelName].public) {
              let model = db[modelName];
              let url = `${prefix}/${serviceName}/${modelName}`.toLowerCase();

              let runAction = (req, res, next, actionName) => {
                if (!model.acl[actionName]
                  || req.isHavePermission(`${serviceName.toLowerCase()}:${modelName.toLowerCase()}:${actionName}`)) {
                  req.params.actionName = actionName;
                  req.params.serviceName = serviceName;
                  req.params.modelName = capitalizeFirstLetter(modelName);
                  executeAction(req, res, next, service, app);
                } else {
                  res.status(401).json({
                    error: 'Permissions Deny'
                  });
                }
              };

              app.get(url, (req, res, next) => {
                runAction(req, res, next, 'findAll');
              });
              app.post(url, (req, res, next) => {
                runAction(req, res, next, 'create');
              });
              app.get(url + '/:hashId', (req, res, next) => {
                runAction(req, res, next, 'find');
              });
              app.put(url + '/:hashId', (req, res, next) => {
                runAction(req, res, next, 'update');
              });
              app.delete(url + '/:hashId', (req, res, next) => {
                runAction(req, res, next, 'delete');
              });
            }
          });
        });
      }
    });

    setTimeout(resolve, 1000);
  });
}
