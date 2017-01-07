export function up({instance, User, Role, Permission}) {
  return instance.sync().then(() => {
    return new Promise(resolve => {
      Promise.all([
        User.create({email: 'admin@shopmaek.ru', password: 'admin'}),
        Role.create({name: 'administrator'}),

        Permission.create({service: 'identity', model: 'user', method: 'list'}),
        Permission.create({service: 'identity', model: 'user', method: 'edit'}),
        Permission.create({service: 'identity', model: 'user', method: 'delete'}),

        Permission.create({service: 'identity', model: 'role', method: 'list'}),
        Permission.create({service: 'identity', model: 'role', method: 'edit'}),
        Permission.create({service: 'identity', model: 'role', method: 'delete'}),

        Permission.create({service: 'identity', model: 'permission', method: 'list'}),
        Permission.create({service: 'identity', model: 'permission', method: 'edit'}),
        Permission.create({service: 'identity', model: 'permission', method: 'delete'})
      ]).then(([user, role, iul, iue, iud, irl, ire, ird, ipl, ipe, ipd]) => {
        Promise.all([
          user.addRole(role),
          role.addPermissions([iul, iue, iud, irl, ire, ird, ipl, ipe, ipd])
        ]).then(() => {
          resolve();
        });
      });
    });
  });
}