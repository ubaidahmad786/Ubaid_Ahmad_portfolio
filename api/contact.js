export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request (CORS preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        // Backend Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        // Email regex check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email address format.' });
        }

        // Log message details on the backend
        console.log(`[CONTACT RECEIVED] Name: ${name}, Email: ${email}, Subject: ${subject}`);
        console.log(`[MESSAGE CONTENT] ${message}`);

        // In a real environment, you can configure Nodemailer or SendGrid to email this message to ubaidhusain99@gmail.com.
        // We log it here and return a successful JSON payload.
        return res.status(200).json({
            success: true,
            message: `Thank you, ${name}! Your message was successfully received by Ubaid's portfolio backend. Ubaid will get back to you shortly.`
        });
    } catch (err) {
        console.error('Contact Form Endpoint Error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error while processing your request.' });
    }
}
