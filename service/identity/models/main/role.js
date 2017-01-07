export const classMethods = {
  associate: function ({User, Role, Permission}) {
    Role.belongsToMany(User, {
      through: 'user_has_role',
      foreignKey: 'roleId',
      otherKey: 'userId'
    });

    Role.belongsToMany(Permission, {
      through: 'role_has_permission',
      foreignKey: 'roleId',
      otherKey: 'permissionId'
    });
  }
};
