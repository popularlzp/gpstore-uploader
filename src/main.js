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
        const edit = yield play.edits.insert({ packageName });
        const { data: bundle } = yield play.edits.bundles.upload({
            packageName,
            editId: edit.data.id,
            media: {
                mimeType: 'application/octet-stream',
                body: require('fs').createReadStream(aabFilePath),
            },
        });
        yield play.edits.tracks.update({
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
        yield play.edits.commit({ packageName, editId: edit.data.id });
    });
}
void run();
