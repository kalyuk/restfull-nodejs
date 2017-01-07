import series from 'async/series';
import path from 'path';

export default function (app) {
  let list = ['body-parser'];

  return new Promise(resolve => {
    list = list.map(middlewareName => {
      return (callback) => {
        require(path.join(__dirname, '..', 'middleware', middlewareName + '.js')).default(app);
        callback();
      };
    });

    series(list, (err)=> {
      if (!err) {
        resolve();
      }
    });
  });
}


/*
 import path from 'path'
 export default function (app) {

 let middlewares = app.getConfig('middleware').middleware;

 let current = 0;

 function next(resolve) {

 if (current < middlewares.length) {

 let name = middlewares[current].name;

 console.info('middleware:' + name + ':run');
 require(path.join(__dirname, '..', 'middleware', name + '.js')).default(app, middlewares[current].options)
 .then(() => {
 console.info('middleware:' + name + ':complete');
 current++;
 next(resolve)
 })
 } else {
 resolve();
 }
 }

 return new Promise(resolve => {
 next(resolve)
 })

 }
 */