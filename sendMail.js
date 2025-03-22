require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtpout.secureserver.net", // GoDaddy SMTP server
    port: process.env.MAIL_PORT || 465, // Use 465 for SSL or 587 for TLS
    secure: true, // Set to true for port 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false, // Bypass SSL errors if needed
        ciphers: "SSLv3"
    }
});

// API endpoint to send emails
app.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER, // Sender email
            to,
            subject,
            text
        });

        res.json({ message: 'Email sent successfully!', info });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = 6001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
