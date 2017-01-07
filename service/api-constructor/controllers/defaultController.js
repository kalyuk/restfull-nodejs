import {capitalizeFirstLetter} from '../../../helpers/string';

export function executeAction({method, params, query, body}, res, next, service, app) {
  let executeMethod = 'find';
  let serviceName = params.service;
  let modelName = capitalizeFirstLetter(params.model);
  let model = null;

  let where = {};
  let $body = {};
  if (app.service[serviceName] && app.service[serviceName].db) {
    Object.keys(app.service[serviceName].db).forEach(dbName => {
      if (modelName !== 'instance' && app.service[serviceName].db[dbName][modelName]) {
        model = app.service[serviceName].db[dbName][modelName];
      }
    });
    if (model === null) {
      next();
    }
  } else {
    return next();
  }

  if (method === 'GET' && !params.hashId) {
    executeMethod = 'findAll';
    if (query && query.filter) {
      where = JSON.parse(query.filter);
    }
  } else if (method === 'POST') {
    executeMethod = 'create';
  }

  if (params.hashId) {
    where.id = model.hashIds.decode(params.hashId);
  }

  if (['GET', 'PUT', 'DELETE'].indexOf(method) !== -1) {
    Object.assign($body, {where});
  }

  if (['POST'].indexOf(method) !== -1) {
    Object.assign($body, body);
  }


  return model[executeMethod]($body).then((data) => {
    res.json({
      data
    });
  }).catch((error) => {
    res.status(500).json({
      error: app.options.ENV === 'develop' ? error : {message: error.message}
    });
  });
}
