import express from 'express';
import path from 'path';

export default function (app, {url}) {
  return new Promise(resolve => {
    app.use(url, express.static(path.join(__dirname, '..', '..', '..', 'node_modules/swagger-ui/dist')));
    resolve();
  });
}
