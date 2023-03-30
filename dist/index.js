const { google } = require('googleapis');
const fs = require('fs');

async function releaseToPlayStore(packageName, track, credentials, releaseNotes, aabFilePath) {
  const play = google.androidpublisher('v3');

  const authClient = await google.auth.getClient({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  google.options({
    auth: authClient,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Accept-Encoding': 'gzip',
      'User-Agent': 'MyApp/1.0.0',
    },
  });

  const edit = await play.edits.insert({ packageName });

  const { data: bundle } = await play.edits.bundles.upload({
    packageName,
    editId: edit.data.id,
    media: {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(aabFilePath),
    },
  });

  await play.edits.tracks.update({
    packageName,
    editId: edit.data.id,
    track,
    requestBody: {
      releases: [
        {
          versionCodes: [bundle.versionCode],
          status: 'completed',
          releaseNotes: [
            {
              language: 'en-US',
              text: releaseNotes,
            },
          ],
        },
      ],
    },
  });

  await play.edits.commit({ packageName, editId: edit.data.id });
}

