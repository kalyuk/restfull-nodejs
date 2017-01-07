import bodyParser from 'body-parser';

export default function (app) {
  return new Promise(resolve => {
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    resolve();
  });
}
