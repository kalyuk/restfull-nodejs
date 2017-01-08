export function loginAction(req, res, {options: {SECRET}, db: {main: {User}}}) {
  User.login(req.body.email, req.body.password, SECRET, req.ip).then((user) => {
    res.json({
      data: user
    });
  }).catch(error => {
    res.status(409).json({
      error
    });
  });
}
