## Sentiment Analysis Bot (S.A.L.)

Web app deployed at https://sal.moonshot.cloud/. Sal engages users in a brief conversation, observing their emotions via video and text analysis.

### Notes
* Deployed via Dokku.
* Uses Google Cloud [Speech API](https://cloud.google.com/speech/) for transcription and [Natural Language API](https://cloud.google.com/natural-language/) for text sentiment analysis.
* Uses [Affectiva](https://www.affectiva.com/) for video emotion recognition.
* Uses [Amazon Polly](https://aws.amazon.com/polly/) for speech synthesis.
* Uses [p5.js](https://p5js.org/) for volume indication and emotion graphs.
* Saves feedback to jokes for future reference.

### Routes
* GET `/` -> app
* POST `/process` -> converts audio webm to flac via ffmpeg before transcribing via Google Cloud.
* POST `/generate` -> takes text input and returns audio file of speech synthesis via Polly.
* POST `/stats/log-joke` -> records joke response.

### Env
Add a `.env` with the following:

```
GOOGLE_APPLICATION_CREDENTIALS=keyfile.json
AWS_REGION=''
AWS_ACCESS=''
AWS_SECRET_ACCESS=''
```

### keyfile.json
You must also have a `keyfile.json` at the root (or wherever you specify in the `.env`), downloaded from Google Cloud. It should look like this:

```
{
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": ""
}

```
