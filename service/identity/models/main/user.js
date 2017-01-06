import passwordHash from 'password-hash';

export default (sequelize, DataTypes) => {
  let User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      swagger: {
        minLength: 5,
        maxLength: 64,
        required: true,
        type: 'string'
      }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.VIRTUAL,
      swagger: {
        minLength: 5,
        maxLength: 128,
        required: true,
        type: 'string'
      },
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
      allowNull: false,
      swagger: {
        description: 'by default used "new"',
        type: 'string',
        enum: ['new', 'blocked']
      }
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
