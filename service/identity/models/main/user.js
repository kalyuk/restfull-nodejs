import passwordHash from 'password-hash';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const setterMethods = {
  password: function (value) {
    this.setDataValue('password', value);
    this.setDataValue('passwordHash', passwordHash.generate(value));
  }
};

export const validate = {
  rules: function () {
    if (this.password.length < 4) {
      throw new Error('Please choose a longer password');
    }
    if (this.password.length > 128) {
      throw new Error('Please choose a smaller password');
    }
  }
};

export const instanceMethods = {
  validPassword: function (password) {
    return passwordHash.verify(password, this.passwordHash);
  }
};

export const classMethods = {
  associate: function ({User, Role}) {
    User.belongsToMany(Role, {
      through: 'user_has_role',
      foreignKey: 'userId',
      otherKey: 'roleId'
    });
  },
  login: function (email, password, secret, ip) {
    let {Role, Permission} = this.sequelize.models;
    return new Promise((resolve, reject) => {
      this.find({
        include: [{model: Role, include: [Permission]}],
        where: {
          email: email
        }
      }).then(user => {
        if (user && user.validPassword(password)) {
          let permissions = [];
          let roles = user.roles.map(role => {
            role.permissions.forEach(permission => {
              permissions.push(`${permission.service}:${permission.model}:${permission.method}`);
            });
            return role.name;
          });

          let expireDate = new Date();
          expireDate.setHours(expireDate.getHours() + 8);
          let exp = expireDate.getTime();
          let token = jwt.sign({
            hash: crypto.createHash('md5').update(secret + ip).digest('hex'),
            user: {
              id: user.id,
              email: user.email,
              hashId: user.encode(user.id),
              status: user.status
            },
            roles,
            permissions,
            exp
          }, secret);

          return resolve({
            token,
            exp
          });
        }
        return reject({email: 'Email or password invalid'});
      });
    });
  }
};
