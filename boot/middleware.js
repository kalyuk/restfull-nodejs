import series from 'async/series';
import path from 'path';

export default function (app) {
  let list = [
    'is-have-permissions',
    'body-parser'
  ];

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