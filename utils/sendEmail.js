const nodemailer = require("nodemailer");

exports.sendEmail = async (email, subject, content) => {
  try {
    const transporter = nodemailer.createTransport({
     
      service: "gmail",
      auth: {
        user: "onlinenishantparashar@gmail.com",
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "onlinenishantparashar@gmail.com",
      to: email,
      subject: subject,
      text: JSON.stringify(content),
    };

    await transporter.sendMail(mailOptions); 
    return true;
    
  } catch (error) {
    console.log("Error while sending email: Internal Server Error: ", error);
    return false;
  }
};
