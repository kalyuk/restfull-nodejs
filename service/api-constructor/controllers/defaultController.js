function includes(model, db, schema, req) {
  let include = [];
  let {serviceName, modelName} = req.params;


  schema.forEach(params => {
    if (params.model !== 'instance' && db[params.model]) {
      let actionName = model.associations[db[params.model].options.name.plural] ? 'findAll' : 'find';

      if (!db[params.model].acl[actionName]
        || req.isHavePermission(`${serviceName.toLowerCase()}:${modelName.toLowerCase()}:${actionName}`)
      ) {
        params.model = db[params.model];
        if (params.include) {
          params.include = includes(model, db, params.include, req);
        }
        include.push(params);
      }
    }
  });

  return include;
}
export function executeAction(req, res, next, service, app) {
  let {method, params, query, body} = req;
  let executeMethod = params.actionName;
  let serviceName = params.serviceName;
  let modelName = params.modelName;
  let model = null;

  let where = {};
  let include = [];
  let $body = {};
  let db = {};
  if (app.service[serviceName] && app.service[serviceName].db) {
    Object.keys(app.service[serviceName].db).forEach(dbName => {
      if (modelName !== 'instance' && app.service[serviceName].db[dbName][modelName]) {
        db = app.service[serviceName].db[dbName];
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
    if (query && query.filter) {
      where = JSON.parse(query.filter);
    }
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

  if (query && query.include && ['GET'].indexOf(method) !== -1) {
    include = includes(model, db, JSON.parse(query.include), req);
    Object.assign($body, {include});
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
