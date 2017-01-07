export default function () {
  return {
    develop: {
      main: {
        database: 'shopmaek-user',
        username: 'shopmaek',
        password: 'shopmaek',
        params: {
          host: 'localhost',
          dialect: 'postgres'
        },
        hashIds: {
          salt: '38dkw947nd937x',
          length: 8,
          key: 'ABCDEFGHKLMNPRSTUWXYZ1234567890'
        }
      }
    }
  };
}
