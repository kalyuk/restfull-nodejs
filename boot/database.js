export default function (app) {
  return new Promise(resolve => {
    setTimeout(resolve, 1000);
  });
}
