import path from 'path';

export default function (app) {
  return new Promise(resolve => {
    let routes = app.get('routes');
    let controllers = {};

    Object.keys(routes).forEach(serviceName => {
      Object.keys(routes[serviceName]).forEach(route => {
        let data = route.split(' ');

        let method = data[0].toLowerCase();
        let uri = data[1] || '';

        if (data.length === 1) {
          method = 'all';
          uri = data[0];
        }

        method = ['all', 'get', 'post', 'put', 'delete'].indexOf(method) !== -1 ? method : 'all';

        let {controller, action, prefix, needPermission} = routes[serviceName][route];

        if (!controllers[`${serviceName}:${controller}`]) {
          let controllerPath = path.join(
            __dirname,
            '..',
            'service',
            serviceName,
            'controllers',
            controller + 'Controller'
          );
          controllers[`${serviceName}:${controller}`] = require(controllerPath);
        }

        app[method](`${(prefix ? prefix : '/api')}/${serviceName}${uri}`, (req, res) => {
          if (!needPermission
            || req.isHavePermission(`${serviceName.toLowerCase()}:${controller.toLowerCase()}:${action}`)) {
            return controllers[`${serviceName}:${controller}`][action + 'Action'](req, res, app.service[serviceName]);
          }
          return res.status(401).json({
            error: 'Permission deny'
          });

        });
      });
    });

    resolve();
  });
}
