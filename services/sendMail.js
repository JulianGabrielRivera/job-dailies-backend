const nodemailer = require("nodemailer");

module.exports = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    host: process.env.HOST,
    port: 587,
    secure: false,
    auth: {
      user: "jobdailies@gmail.com",
      pass: "bbxshrqnkedbdtuv",
    },
  });

  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      // do something useful
    }
  });
};
// try {
//   const transporter = nodemailer.createTransport({
//     host: process.env.HOST,
//     service: process.env.SERVICE,
//     port: Number(process.env.EMAIL_PORT),
//     secure: Boolean(process.env.SECURE),
//     auth: {
//       user: process.env.USER,
//       pass: process.env.PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: process.env.USER,
//     to: email,
//     subject: subject,
//     text: text,
//   });
//   console.log("email sent successfully");
// } catch (error) {
//   console.log("email not sent!");
//   console.log(error);
//   return error;
// }
