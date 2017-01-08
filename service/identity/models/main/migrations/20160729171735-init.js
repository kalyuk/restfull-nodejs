export function up({instance, User, Role, Permission}) {
  return instance.sync().then(() => {
    return new Promise(resolve => {
      Promise.all([
        User.create({email: 'admin@shopmaek.ru', password: 'admin'}),
        Role.create({name: 'administrator'}),

        Permission.create({service: 'identity', model: 'user', method: 'find'}),
        Permission.create({service: 'identity', model: 'user', method: 'findAll'}),
        Permission.create({service: 'identity', model: 'user', method: 'update'}),
        Permission.create({service: 'identity', model: 'user', method: 'destroy'}),

        Permission.create({service: 'identity', model: 'role', method: 'find'}),
        Permission.create({service: 'identity', model: 'role', method: 'findAll'}),
        Permission.create({service: 'identity', model: 'role', method: 'update'}),
        Permission.create({service: 'identity', model: 'role', method: 'create'}),
        Permission.create({service: 'identity', model: 'role', method: 'destroy'}),

        Permission.create({service: 'identity', model: 'permission', method: 'find'}),
        Permission.create({service: 'identity', model: 'permission', method: 'findAll'}),
        Permission.create({service: 'identity', model: 'permission', method: 'update'}),
        Permission.create({service: 'identity', model: 'permission', method: 'create'}),
        Permission.create({service: 'identity', model: 'permission', method: 'delete'})
      ]).then(([
        user, role,
        iuf, iufa, iuu, iud,
        irf, irfa, iru, irc, ird,
        ipf, ipfa, ipu, ipc, ipd]) => {
        Promise.all([
          user.addRole(role),
          role.addPermissions([
            iuf, iufa, iuu, iud,
            irf, irfa, iru, irc, ird,
            ipf, ipfa, ipu, ipc, ipd
          ])
        ]).then(() => {
          resolve();
        });
      });
    });
  });
}