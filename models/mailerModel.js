// const nodemailer = require("nodemailer");
// require('dotenv').config();
// const sendEmail = async (sending_email, subjectheading, textsend) => {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     });

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: sending_email,
//         subject: subjectheading,
//         text: textsend
//     };

//     return new Promise((resolve, reject) => {
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error sending email:', error);
//                 reject('Failed to send email');
//             } else {
//                 console.log('Email sent:', info.response);
//                 resolve('Message has been sent to your email');
//             }
//         });
//     });
// };

// module.exports = { sendEmail };


require('dotenv').config({ path: '../../.env' });
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SendGridKey);

async function sendEmail(to, subject, htmlContent, textContent) {
  const msg = {
    to: to, // Recipient's email
    from: 'Link Ur Codes Team <team@linkurcodes.com>', // Sender's email
    subject: subject,
    text: textContent,
    html: htmlContent,
  };
  // Send the email
  sgMail.send(msg)
    .then(() => {
      console.log('Email has been sent');
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = {
  sendEmail
};
