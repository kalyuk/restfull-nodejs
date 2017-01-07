export function loginAction({body}, res, {db: {main: {User}}}) {
  User.login(body.email, body.password).then((user) => {
    res.json({
      data: user
    });
  }).catch(error => {
    res.status(409).json({
      error
    });
  });
}
