"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
function releaseToPlayStore(packageName, track, credentials, releaseNotes, aabFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting release process...');
        const play = googleapis_1.google.androidpublisher('v3');
        const authClient = yield googleapis_1.google.auth.getClient({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });
        googleapis_1.google.options({
            auth: authClient,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Accept-Encoding': 'gzip',
                'User-Agent': 'MyApp/1.0.0',
            },
        });
        console.log('Creating new edit...');
        const edit = yield play.edits.insert({ packageName });
        console.log(`Created new edit with id ${edit.data.id}`);
        console.log(`Uploading AAB file ${aabFilePath}...`);
        const { data: bundle } = yield play.edits.bundles.upload({
            packageName,
            editId: edit.data.id,
            media: {
                mimeType: 'application/octet-stream',
                body: require('fs').createReadStream(aabFilePath),
            },
        });
        console.log(`Uploaded AAB file with version code ${bundle.versionCode}`);
        console.log(`Updating release track to ${track}...`);
        yield play.edits.tracks.update({
            packageName: packageName,
            editId: edit.data.id,
            track,
            requestBody: {
                releases: [
                    {
                        versionCodes: [`${bundle.versionCode}`],
                        // userFraction: 1,
                        releaseNotes: [
                            {
                                language: 'en-US',
                                text: releaseNotes,
                            },
                        ],
                        status: 'draft' // 添加发布状态
                    },
                ],
            },
        });
        console.log('Committing edit...');
        const commitResult = yield play.edits.commit({
            packageName: packageName,
            editId: edit.data.id,
        });
        console.log(`Committed edit with id ${commitResult.data.id}`);
    });
}
void releaseToPlayStore('com.ecotopia.us', 'beta', {
    "xx": ""
}, 'This is a release note.', '/Users/druid/as/Application/DruidEcotopia/app/ecotopia_us_google/release/app-ecotopia_us_google-release.aab');
//# sourceMappingURL=index.js.map