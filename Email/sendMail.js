// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const api_key = require("./credentials").sendGridApiKey;
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(api_key);
const msg = {
  to: "test@example.com",
  from: "test@example.com",
  subject: "Sending with SendGrid is Fun",
  text: "and easy to do anywhere, even with Node.js",
  html: "<strong>and easy to do anywhere, even with Node.js</strong>"
};
sgMail.send(msg);
