import passwordHash from 'password-hash';

export default (sequelize, DataTypes) => {
  let User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.VIRTUAL,
      set: function (val) {
        this.setDataValue('password', val);
        this.setDataValue('passwordHash', passwordHash.generate(val));
      },
      validate: {
        isLongEnough: function (val) {
          if (val.length < 4) {
            throw new Error('Please choose a longer password');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('new', 'blocked'),
      defaultValue: 'new',
      allowNull: false
    }
  }, {
    tableName: 'user',
    instanceMethods: {
      validPassword: function (password) {
        return passwordHash.verify(password, this.passwordHash);
      }
    },
    classMethods: {},
    name: {
      singular: 'user',
      plural: 'users'
    }
  });
  return User;
};
