const nodemailer = require("nodemailer");
const keys = require("../credentials");

let frontendUrl = "localhost:3000"

module.exports = async (token, host, receiver, usage) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      clientId: keys.googleClientId,
      clientSecret: keys.googleClientSecret

    },
    tls: { rejectUnauthorized: false }
  });

  let output = ``;
  if (usage == "verify") {
    output = `
    <h2>Please click on the button below to confirm your email</h2>
     
       <a href="http://${frontendUrl}/auth/confirmation/${token}">Confirm</a>
      `;
  } else {
    output = `
    <h2>Please click on the button below to reset your password</h2>
     
       <a href="http://${frontendUrl}/reset/${token}">Reset password</a>
      `;
  }

  // setup email data with unicode symbols
  let mailOptions = {
    from: "Node Contact<ukogdna6560@gmail.com>", // sender address
    to: receiver, // list of receivers
    subject: "Email confirmation", // Subject line
    text: "Hello world?", // plain text body
    html: output, // html body
    auth:{
      user: keys.user,
      refreshToken: keys.refreshToken
    }
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
  });
};
