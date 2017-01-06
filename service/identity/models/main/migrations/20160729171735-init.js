export function up({instance, User}) {
  return instance.sync().then(() => {
    return User.create({
      email: 'admin@shopmaek.ru', password: 'admin'
    });
  });
}