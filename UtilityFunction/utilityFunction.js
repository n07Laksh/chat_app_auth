function sendCookie( res, key, value ) {

  const expDay = process.env.JWT_COOKIE_EXPIR_IN || 100;

  const exDate = new Date(Date.now() + expDay * 24 * 60 * 60 * 1000);

  const cookieOptions = {
    path: "/",
    expires: exDate,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    Partitioned: true,
  };

  res.cookie(key, value, cookieOptions);
}

module.exports = { sendCookie };
