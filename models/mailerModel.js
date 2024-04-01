const nodemailer = require("nodemailer");
require('dotenv').config();
const sendEmail = async (sending_email, subjectheading, textsend) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: sending_email,
        subject: subjectheading,
        text: textsend
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                reject('Failed to send email');
            } else {
                console.log('Email sent:', info.response);
                resolve('Message has been sent to your email');
            }
        });
    });
};

module.exports = { sendEmail };