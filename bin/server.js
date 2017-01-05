import express from 'express';
import each from 'async/each';
import series from 'async/series';
import glob from 'glob';
import path from 'path';

class Server {

  boot = [
    'database',
    'service-boot',
    'middleware',
    'router'
  ];

  __options = {
    PORT: 1987,
    SERVICES: 'swagger'
  };

  constructor() {
    this.__app = express();
    this.__app.disable('x-powered-by');

    process.argv.forEach((val) => {
      let tmp = val.split('=');
      this.__options[tmp[0].toUpperCase()] = tmp[1];
    });

    this.loadConfigs().then(config => {
      return this.runBoot(config);
    });
  }

  loadConfigs() {
    return new Promise(resolve => {
      let services = this.getOption('SERVICES').split(',');
      let config = {};

      each(services, (service, callback) => {
        glob(path.join(__dirname, '..', 'service', service, 'config', '**', '*.js'), (err, files) => {
          files.forEach(file => {
            let name = file.split('/').pop().split('.js')[0];
            if (!config[name]) {
              config[name] = {};
            }
            config[name][service] = require(file).default(this.__app);
          });
          callback(null);
        });
      }, () => {
        Object.keys(config).forEach(key => {
          this.__app.set(key, config[key]);
        });
        resolve();
      });
    });
  }

  getOption(option) {
    return this.__options[option];
  }

  runBoot() {
    console.log('Run boot'); // eslint-disable-line no-console
    return new Promise(resolve => {
      let s = this.boot.map(module => {
        return (callback) => {
          console.log(`... ${module}`); // eslint-disable-line no-console
          let m = require(path.join(__dirname, '..', 'boot', module));
          m.default(this.__app).then(() => {
            callback(null);
          });
        };
      });

      series(s, () => {
        console.log('Boot loaded'); // eslint-disable-line no-console
        resolve();
      });
    });
  }

  run() {
    return new Promise(resolve => {
      this.__app.listen(this.getOption('PORT'), () => {
        resolve();
      });
    });
  }
}

let server = new Server();
server.run().then(() => {
  console.log(`Web server listening at: http://localhost:${server.getOption('PORT')}`); // eslint-disable-line no-console
});
