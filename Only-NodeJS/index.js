const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const wsp = require('./whatsapp');

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
async function saveCredentials(client) {
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


async function authorize() {
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


async function getLisMessageIds(auth) {

    try {


        const gmail = google.gmail({ version: 'v1', auth });
        const res = await gmail.users.messages.list({
            userId: 'me',
            labelIds: ["UNREAD"],
        });


        const msgList = res.data.messages;

        if (!msgList) {
            console.log('No hay mensajes de la lista pendientes');
        }

        let dudas = 0;
        let quejas = 0;
        let compras = 0;

        const msgMarked = [];
        const msgListMark = new Set();

        await msgList?.forEach(async (msg, index, msgList,
        ) => {
            let res = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
            });

            const mail = res?.data?.payload.headers[6].value.slice(1, -1);


            const word = String(res.data.snippet).toLowerCase();
            let msgSend;
            if (word.includes("duda")) {
                dudas += 1;
                msgListMark.add(mail);
                msgSend = "Gracias por tu duda, te responderemos lo antes posible";
            }
            if (word.includes("queja")) {
                quejas += 1;
                msgListMark.add(mail);
                msgSend = "Gracias por comunicarnos tu queja, te responderemos lo antes posible";
            }
            if (word.includes("compra")) {
                compras += 1;
                msgListMark.add(mail);
                msgSend = "Gracias por contactar con nosotros, te responderemos lo antes posible sobre tu compra";
            }

            console.log(dudas, quejas, compras);

            if (msgSend?.length > 0) {


                const raw = makeBody(mail, "joseguzmandev@gmail.com", "Soporte Respuesta", msgSend);

                const res = await gmail.users.messages.send({
                    userId: 'me',
                    resource: {
                        raw: raw,
                    },
                });

            }
            const modify = await gmail.users.messages.modify({
                // The ID of the message to modify.
                id: msg.id,
                // The user's email address. The special value `me` can be used to indicate the authenticated user.
                userId: 'me',

                // Request body metadata
                requestBody: {
                    // request body parameters
                    // {
                    //   "addLabelIds": [],
                    "removeLabelIds": ['UNREAD'],
                    // }
                },
            });
            console.log(modify.data);
            if (index === msgList.length - 1) {
                console.log(msgMarked);
                wsp(`Tienes pendientes por contestar \n\nDudas: ${dudas}, \nQuejas: ${quejas}, \nCompras: ${compras}\n Correos pendientes: \n ${new Array(...msgListMark).join(' ')}`);
            }
        });


        function makeBody(to, from, subject, message) {
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

    } catch (error) {
        console.log('chin');
    }
}



authorize().then(getLisMessageIds).catch(console.log('error'));
