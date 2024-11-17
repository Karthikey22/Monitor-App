const twilio=require('twilio');
require('dotenv').config();

const accountSid=process.env.TWILIO_ACCOUNT_SID;
const authToken=process.env.TWILIO_AUTH_TOKEN;

const client=twilio(accountSid,authToken);

const sendSMS = async () => {
    try {
        const message = await client.messages.create({
            body: 'Twilio test!', // Message content
            from: '++15053334302', // Replace with your Twilio number
            to: '+919790096279'    // Replace with recipient's phone number
        });
        console.log('Message sent successfully:', message.sid);
    } catch (error) {
        console.error('Error sending message:', error.message);
    }
};

sendSMS()