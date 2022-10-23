const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
import { gmail_v1, google } from 'googleapis';

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client: JSONClient | null) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 * equisde
 *
 */


export default async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getLisMessageIds(auth: any) {

    try {
        console.log('getLisMessageIds');

        const gmail = google.gmail({ version: 'v1', auth });
        const res = await gmail.users.messages.list({
            userId: 'me',
            labelIds: ["UNREAD"],
        });


        let msgList = res.data.messages;
        console.log(msgList);

        const messages = [];

        await msgList?.forEach(async (msg, index, messages) => {
            let res = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
            });


            const mail = res?.data?.payload.headers[6].value.slice(1, -1);
            console.log(mail)

            sendIfInclude(mail, String(res.data.snippet), gmail);
            messages.push(res.data.snippet);
        });

        function makeBody(to: any, from: string, subject: string, message: string | undefined) {
            var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
                "MIME-Version: 1.0\n",
                "Content-Transfer-Encoding: 7bit\n",
                "to: ", to, "\n",
                "from: ", from, "\n",
                "subject: ", subject, "\n\n",
                message
            ].join('');
            return btoa(str);
        }

        const sendIfInclude = async (mail: string, wordSearch: string, gmail: gmail_v1.Gmail) => {
            console.log('mail', mail);
            const word = wordSearch.toLowerCase();
            let msg;
            if (word.includes("duda")) {
                msg = "Gracias por tu duda, te responderemos lo antes posible";
            }
            if (word.includes("queja")) {
                msg = "Gracias por comunicarnos tu queja, te responderemos lo antes posible";
            }
            if (word.includes("compra")) {
                msg = "Gracias por contactar con nosotros, te responderemos lo antes posible sobre tu compra";
            }

            if (msg?.length > 0) {


                const raw = makeBody(mail, "joseguzmandev@gmail.com", "Soporte Respuesta", msg);

                const res = await gmail.users.messages.send({
                    userId: 'me',
                    resource: {
                        raw: raw,
                    },
                });

            }

        }

    } catch (error) {
        console.log(error);
    }
}


//authorize().then(getLisMessageIds).catch(console.error);

