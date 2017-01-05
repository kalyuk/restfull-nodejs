import path from 'path';
export function ui(req, res) {
  res.sendFile(path.join(__dirname, '..', '..', '..', 'node_modules/swagger-ui/dist/index.html'));
}
