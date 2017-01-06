export default function (app) {
  app.service.swagger.schema = {
    swagger: '2.0',
    host: 'petstore.swagger.io',
    basePath: '/api',
    tags: [],
    schemes: ['http', 'https'],
    paths: {},
    securityDefinitions: {},
    definitions: {}
  };

  Object.keys(app.service).forEach(service => {
    if (service !== 'swagger') {
      app.service.swagger.schema.tags.push({name: service});

      if (app.service[service].db) {
        Object.keys(app.service[service].db).forEach(dbName => {
          Object.keys(app.service[service].db[dbName]).forEach(modelName => {

            if (modelName !== 'instance') {
              app.service.swagger.schema.definitions[`${service}:${modelName}`] = {
                type: 'object',
                properties: {}
              };

              Object.keys(app.service[service].db[dbName][modelName].rawAttributes).forEach(attr => {
                if (app.service[service].db[dbName][modelName].rawAttributes[attr].swagger) {
                  app.service.swagger.schema.definitions[`${service}:${modelName}`].properties[attr] =
                    app.service[service].db[dbName][modelName].rawAttributes[attr].swagger;
                }
              });

              let url = `/${service}/${modelName}`.toLowerCase();

              ['get:list', 'get', 'post', 'delete', 'put'].forEach(method => {
                let $url = url;

                let options = {
                  tags: [service],
                  operationId: `${service}-${modelName}-${method}`,
                  consumes: ['application/json'],
                  parameters: []
                };

                if (['post', 'put', 'get'].indexOf(method) !== -1) {
                  options.responses = {
                    200: {
                      schema: {
                        $ref: `#/definitions/${service}:${modelName}`
                      }
                    }
                  };
                }

                if (['get:list'].indexOf(method) !== -1) {
                  options.responses = {
                    200: {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: `#/definitions/${service}:${modelName}`
                        }
                      }
                    }
                  };
                }

                if (['get', 'get:list'].indexOf(method) !== -1) {
                  options.parameters.push({
                    name: 'filter',
                    in: 'path',
                    type: 'string'
                  });
                }

                if (['get', 'delete', 'put'].indexOf(method) !== -1) {
                  $url += '/{hashId}';
                  options.parameters.push({
                    name: 'hashId',
                    in: 'path',
                    required: true,
                    type: 'string'
                  });
                }

                if (['post', 'put'].indexOf(method) !== -1) {
                  options.parameters.push({
                    in: 'body',
                    name: 'body',
                    required: true,
                    schema: {
                      $ref: `#/definitions/${service}:${modelName}`
                    }
                  });
                }

                if (!app.service.swagger.schema.paths[$url]) {
                  app.service.swagger.schema.paths[$url] = {};
                }

                app.service.swagger.schema.paths[$url][method.split(':')[0]] = options;
              });
            }
          });
        });
      }
    }
  });

  return Promise.resolve();
}
