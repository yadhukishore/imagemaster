import nodeMailer from "nodemailer";
import { AppResponse } from "./appUtils.js";

const sendMail = async (res, email, resetUrl) => {
  try {
    const transporter = nodeMailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"ImageMaster" <arjunreddy8921@gmail.com>', 
      to: email,
      subject: `Password Reset`,
      text: `Click the following link to reset your password: ${resetUrl}`,
    };
    

    await transporter.sendMail(mailOptions);

    new AppResponse(res, 200, "Reset link sent successfully");
  } catch (error) {
    next(error);
  }
};

export default sendMail;
