// const nodemailer = require("nodemailer");

// const sendPasswordResetEmail = async (student_email, student_name) => {
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
//         to: student_email,
//         subject: subjectheading,
//         text: textsend
//     };

//     return new Promise((resolve, reject) => {
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error sending password reset email:', error);
//                 reject('Failed to send password reset email');
//             } else {
//                 console.log('Password reset email sent:', info.response);
//                 resolve('Password reset message has been sent to your email');
//             }
//         });
//     });
// };

// module.exports = { sendPasswordResetEmail };
const nodemailer = require("nodemailer");

const sendPasswordResetEmail = async (student_email, student_name, subjectheading, textsend) => {
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
        to: student_email,
        subject: subjectheading,
        text: textsend
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending password reset email:', error);
                reject('Failed to send password reset email');
            } else {
                console.log('Password reset email sent:', info.response);
                resolve('Password reset message has been sent to your email');
            }
        });
    });
};

module.exports = { sendPasswordResetEmail };

