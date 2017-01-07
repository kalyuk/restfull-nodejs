import path from 'path';
export function uiAction(req, res) {
  res.render(path.join(__dirname, '..', 'template', 'layout.pug'));
}
