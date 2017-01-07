import passwordHash from 'password-hash';
import jwt from 'jsonwebtoken';

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
  login: function (email, password) {
    let {Role, Permission} = this.sequelize.models;
    return new Promise((resolve, reject) => {
      this.find({
        include: [{model: Role, include: [Permission]}],
        where: {
          email: email
        }
      }).then(user => {
        if (user.validPassword(password)) {
          let roles = user.roles.map(role => {
            let tmp = {};
            let t = {};
            role.permissions.forEach(permission => {
              if (!t[`${permission.service}:${permission.model}`]) {
                t[`${permission.service}:${permission.model}`] = 0;
              }
              t[`${permission.service}:${permission.model}`] += 1;
            });
            tmp[role.name] = t;
            return tmp;
          });

          let expireDate = new Date();
          expireDate.setHours(expireDate.getHours() + 8);
          let expireTokenDate = expireDate.getTime();

          expireDate.setHours(expireDate.getHours() + 6);
          let expireRefreshTokenDate = expireDate.getTime();

          let token = jwt.sign({
            user: {
              email: user.email,
              hashId: user.hashId,
              status: user.status
            },
            roles,
            expireRefreshTokenDate,
            expireTokenDate
          }, '9n6sh0032365ds');

          return resolve({
            token,
            expireRefreshTokenDate,
            expireTokenDate
          });
        }
        return reject({email: 'Email or password invalid'});
      });
    });
  }
};
