const nodemailer = require('nodemailer');

const sendMessage = async (req, res) => {
  const { name, email, phone, message, website } = req.body;

  // Honeypot check: real users never see/fill this field, bots usually do
  if (website) {
    return res.status(200).json({ message: "Message sent successfully!" });
  }

  try {
    // Setup for sending the email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // GVS email
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // sending to the same GVS inbox
      replyTo: email,
      subject: `New Message from ${name} (GVS Website)`,
      text: `Name: ${name}\nEmail: ${email}\nPhone Number: ${phone}\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Your message was sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

module.exports = { sendMessage };