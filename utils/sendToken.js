export const sendToken = async (res, user, message, statusCode = 200) => {
  const token = user.getJWTToken();
  const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  // console.log(token);
  res.status(statusCode).cookie("token", token, options).send({
    success: true,
    message,
    user,
    token,
  });
  console.log(res.getHeaders());
};
