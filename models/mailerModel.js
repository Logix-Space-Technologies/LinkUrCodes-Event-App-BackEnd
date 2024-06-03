require('dotenv').config({ path: '../../.env' });
const sgMail = require('@sendgrid/mail');
//npm install @sendgrid/mail
// Set your SendGrid API Key
sgMail.setApiKey(process.env.SendGridKey);

async function sendEmail(to, subject, textContent) {
  const msg = {
    to: to, // Recipient's email
    from: 'Link Ur Codes Team <team@linkurcodes.com>', // Sender's email
    subject: subject,
    text: textContent,
    //html: htmlContent,
  };
  // Send the email
  sgMail.send(msg)
    .then(() => {
      console.log('Email has sent');
    })
    .catch((error) => {
      console.error(error);
    });

}



module.exports = {
  sendEmail
};