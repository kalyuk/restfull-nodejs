export const classMethods = {
  associate: function ({Permission, Role}) {
    Permission.belongsToMany(Role, {
      through: 'role_has_permission',
      foreignKey: 'permissionId',
      otherKey: 'roleId'
    });
  }
};
