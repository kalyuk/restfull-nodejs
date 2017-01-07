export default function () {
  return {
    'POST /login': {
      controller: 'auth',
      action: 'login'
    }
  };
}
