


function sendCookie(res, key, value, expDay) {
    const exDate = new Date(Date.now() + expDay * 24 * 60 * 60 * 1000);

    const cookieOptions = {
        path: "/",
        expires: exDate,
        secure: false,
        httpOnly: true,
    }

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie(key, value, cookieOptions);
}


module.exports = { sendCookie }