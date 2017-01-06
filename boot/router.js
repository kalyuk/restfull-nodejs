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

        let {controller, action} = routes[serviceName][route];

        if (!controllers[`${serviceName}:${controller}`]) {
          let controllerPath = path.join(__dirname, '..', 'service', serviceName, 'controllers', controller);
          controllers[`${serviceName}:${controller}`] = require(controllerPath);
        }

        app[method](`/${serviceName}${uri}`, (req, res) => {
          return controllers[`${serviceName}:${controller}`][action](req, res, app.service[serviceName]);
        });
      });
    });

    resolve();
  });
}
