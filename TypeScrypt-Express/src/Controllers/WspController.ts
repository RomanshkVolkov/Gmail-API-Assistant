import dotenv from "dotenv";
dotenv.config();


export default class WspController {

    sendWspMessage = async (msg: string = 'Probando ando equisde') => {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.AUTH_TOKEN;
        const client = require('twilio')(accountSid, authToken);

        await client.messages
            .create({

                body: msg,
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+5219981287821'
            })
            .then((message: any) => console.log(message.sid))
            .done();
    }
}
