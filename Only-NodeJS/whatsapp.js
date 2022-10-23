require('dotenv').config();
const sendMessage = async (msg) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    await client.messages
        .create({

            body: msg,
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+5219981287821'
        })
        .then((message) => console.log(message.sid))
        .done();
}

module.exports = sendMessage;