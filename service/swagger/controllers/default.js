import path from 'path';
export function ui(req, res) {
  res.render(path.join(__dirname, '..', 'template', 'layout.pug'));
}
