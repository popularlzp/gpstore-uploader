import { google } from 'googleapis';
import * as core from '@actions/core';

async function releaseToPlayStore(
  packageName: string,
  track: string,
  credentials: object,
  releaseNotes: string,
  aabFilePath: string
) {
  console.log('Starting release process...');

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

  console.log('Creating new edit...');

  const edit = await play.edits.insert({ packageName });
  console.log(`Created new edit with id ${edit.data.id}`);

  console.log(`Uploading AAB file ${aabFilePath}...`);

  const { data: bundle } = await play.edits.bundles.upload({
    packageName,
    editId: edit.data.id!,
    media: {
      mimeType: 'application/octet-stream',
      body: require('fs').createReadStream(aabFilePath),
    },
  });

  console.log(`Uploaded AAB file with version code ${bundle.versionCode}`);

  console.log(`Updating release track to ${track}...`);

  await play.edits.tracks.update({
    packageName: packageName!,
    editId: edit.data.id!,
    track,
    requestBody: {
      releases: [
        {
          versionCodes: [`${bundle.versionCode}`], // 将 versionCode 转换为字符串
          // userFraction: 1,
          releaseNotes: [
            {
              language: 'en-US',
              text: releaseNotes,
            },
          ],
          status: 'draft'// 添加发布状态
        },
      ],
    },
  });

  console.log('Committing edit...');

  const commitResult = await play.edits.commit({
    packageName: packageName,
    editId: edit.data.id!,
  });

  console.log(`Committed edit with id ${commitResult.data.id}`);
}



async function run() {
  try {
    const packageName = core.getInput('packageName');
    const track = core.getInput('track');
    const credentials = JSON.parse(core.getInput('credentials'));
    const releaseNotes = core.getInput('releaseNotes');
    const aabFilePath = core.getInput('aabFilePath');

    await releaseToPlayStore(packageName, track, credentials, releaseNotes, aabFilePath);

    // core.setOutput('result', 'success');
 } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();