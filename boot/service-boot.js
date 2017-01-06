import path from 'path';
import series from 'async/series';

export default function (app) {
  return new Promise(resolve => {
    let serviceBoot = app.get('boot');

    if (!serviceBoot) {
      return resolve();
    }

    let boot = [];

    Object.keys(serviceBoot).forEach(key => {
      serviceBoot[key].forEach(({name, options}) => {
        boot.push((callback) => {
          console.log(`... ... ${key} ... ${name}`); // eslint-disable-line no-console
          let module = require(path.join(__dirname, '..', 'service', key, 'boot', name));
          module.default(app, options || {}).then(callback);
        });
      });
    });
    return series(boot, resolve);
  });
}
