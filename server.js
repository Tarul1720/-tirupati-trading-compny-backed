require('dotenv').config();
const express = require('express');
const imaps = require('imap-simple');

const app = express();
app.use(express.json());

const imapConfig = {
    imap: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,
        host: 'imap.gmail.com',  // Change for GoDaddy or other providers
        port: 993,
        tls: true,
        authTimeout: 3000,
        
    }
};

app.get('/receive-emails', async (req, res) => {
    try {
        const connection = await imaps.connect(imapConfig);
        await connection.openBox('INBOX');  // Open the inbox

        const searchCriteria = ['UNSEEN'];  // Fetch unread emails
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: false };
        
        const messages = await connection.search(searchCriteria, fetchOptions);

        let emails = messages.map(msg => ({
            from: msg.parts.find(part => part.which === 'HEADER').body.from[0],
            subject: msg.parts.find(part => part.which === 'HEADER').body.subject[0],
            body: msg.parts.find(part => part.which === 'TEXT').body
        }));

        res.json({ success: true, emails });
    } catch (error) {
        console.error('Error receiving emails:', error);
        res.status(500).json({ success: false, message: 'Failed to receive emails' });
    }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
