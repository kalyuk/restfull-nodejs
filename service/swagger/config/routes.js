export default function () {
  return {
    'GET /': {
      controller: 'default',
      action: 'ui'
    },
    'GET /json': {
      controller: 'json',
      action: 'json'
    }
  };
}
