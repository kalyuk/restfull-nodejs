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
        }
      }
    }
  };
}
