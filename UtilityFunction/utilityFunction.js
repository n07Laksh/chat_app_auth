function sendCookie(res, key, value, expDay) {
  const exDate = new Date(Date.now() + expDay * 24 * 60 * 60 * 1000);

  const cookieOptions = {
    path: "/",
    expires: exDate,
    secure: true,
    httpOnly: true,
    SameSite: "None",
  };

  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true; // enable after client app is deployed in secure ssl
  // https to http is not work while we assign secure true
  res.cookie(key, value, cookieOptions);
}

module.exports = { sendCookie };
