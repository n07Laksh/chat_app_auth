
const cookie = require("cookie");

function sendCookie( res, key, value ) {

  const expDay = process.env.JWT_COOKIE_EXPIR_IN || 100;

  var expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + parseInt(expDay)); // Expires in 100 days

  var setCookie = cookie.serialize(key, String(value), {
    // domain:["chat-app-auth-laxmilals-projects.vercel.app","chat-app-profile-laxmilals-projects.vercel.app"],
    path: "/",
    httpOnly: true,
    expires: expiryDate, // Use the Date object here
    // sameSite: "None",
    // secure: true,
  });

  res.set("Set-Cookie", setCookie);
}

module.exports = { sendCookie };
