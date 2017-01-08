import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default function (app) {
  return new Promise(resolve => {
    app.use((req, res, next) => {
      req.token = {
        roles: [],
        permissions: []
      };

      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        let decoded = jwt.verify(req.headers.authorization.split(' ').pop(), app.options.SECRET);
        if (decoded
          && decoded.exp > (new Date()).getTime()
          && crypto.createHash('md5').update(app.options.SECRET + req.ip).digest('hex') === decoded.hash
        ) {
          Object.assign(req.token, decoded);
        } else {
          return res.status(401).json({
            error: 'Access deny'
          });
        }
      }

      req.isHavePermission = (permission) => {
        return req.token.permissions.indexOf(permission) !== -1;
      };

      return next();
    });

    resolve();
  });
}
