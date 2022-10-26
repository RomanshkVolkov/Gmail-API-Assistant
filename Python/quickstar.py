from __future__ import print_function
import base64
from email.mime.text import MIMEText

import os.path
from time import sleep

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
]


def create_message(sender, to, subject, message_text):
    """Create a message for an email.

    Args:
    sender: Email address of the sender.
    to: Email address of the receiver.
    subject: The subject of the email message.
    message_text: The text of the email message.

    Returns:
    An object containing a base64url encoded email object.
    """
    message = MIMEText(message_text)
    message['Content-Type'] = 'text/plain; charset=\"UTF-8\"\n'
    message['MIME-Version'] = '1.0\n'
    message['Content-Transfer-Encoding'] = '7bit\n"'
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    return base64.urlsafe_b64encode(message.as_string().encode()).decode()


def main():
    """Shows basic usage of the Gmail API.
    Lists the user's Gmail labels.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        # Call the Gmail API
        service = build('gmail', 'v1', credentials=creds)
        results = service.users().messages().list(
            userId='me', labelIds=["UNREAD"]).execute()
        messages = results.get('messages', [])

        if not messages:
            print('No have messages include labels found.')
            return
        print('Labels:')
        for message in messages:
            resultGet = service.users().messages().get(
                userId='me', id=message["id"]).execute()
            messageBody = (resultGet["snippet"]).lower()
            mail = resultGet["payload"]["headers"][6]["value"]
            if len(mail) > 60:
                mail = resultGet["payload"]["headers"][4]["value"]
            start = mail.find("<")
            end = mail.find(">")
            setMail = mail[start+1:end]
            messageSend = ""
            if "duda" in messageBody:
                messageSend = "Hola, soy un bot y te he detectado un mensaje con la palabra duda. Te contesto a tu pregunta: " + messageBody
            if "queja" in messageBody:
                messageSend = "Hola, soy un bot y te he detectado un mensaje con la palabra queja. Te contesto a tu pregunta: " + messageBody
            if "compra" in messageBody:
                messageSend = "Hola, soy un bot y te he detectado un mensaje con la palabra compra. Te contesto a tu pregunta: " + messageBody

            if messageSend != "":
                mensajito = create_message("joseguzmandev@gmail.com",
                                           setMail, "Bot", messageSend)
                resultSend = service.users().messages().send(
                    userId='me', body={"raw": mensajito}).execute()
                resultCheck = service.users().messages().modify(
                    userId='me', id=message["id"], body={"removeLabelIds": ["UNREAD"]}).execute()
            else:
                print("No se ha detectado ninguna palabra clave")

    except HttpError as error:
        # TODO(developer) - Handle errors from gmail API.
        print(f'An error occurred: {error}')


if __name__ == '__main__':
    while True:
        main()
        sleep(15)
