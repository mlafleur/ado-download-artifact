"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ArtifactDownloader = void 0;
const azdev = __importStar(require("azure-devops-node-api"));
const bi = __importStar(require("azure-devops-node-api/interfaces/BuildInterfaces"));
const fs = __importStar(require("fs"));
class ArtifactDownloader {
    constructor() { }
    download(projectId, buildDefinitionId, patToken, orgName, artifactName) {
        return __awaiter(this, void 0, void 0, function* () {
            // base tfs url
            const baseTfsUrl = 'https://dev.azure.com';
            const orgUrl = `${baseTfsUrl}/${orgName}`;
            // get auth handler
            let authHandler = azdev.getPersonalAccessTokenHandler(patToken);
            // get the connection to webapi
            let connection = new azdev.WebApi(orgUrl, authHandler);
            const buildApi = yield connection.getBuildApi();
            // get top build for a particular definitions
            const builds = yield buildApi.getBuilds(projectId, [buildDefinitionId], undefined, undefined, undefined, undefined, undefined, undefined, bi.BuildStatus.Completed, undefined, undefined, undefined, 1, undefined, undefined, undefined, undefined);
            const latestBuild = builds[0];
            // get artifact as zip
            const readableStream = yield buildApi.getArtifactContentZip(projectId, Number(latestBuild.id), artifactName);
            const artifactDirPath = `${process.env.GITHUB_WORKSPACE}/${artifactName}`;
            // create artifact directory if not exists
            if (!fs.existsSync(artifactDirPath)) {
                fs.mkdirSync(artifactDirPath);
            }
            // store artifact
            const artifactFilePathStream = fs.createWriteStream(`${artifactDirPath}/${artifactName}.zip`);
            readableStream.pipe(artifactFilePathStream);
            readableStream.on('end', () => {
                console.log(`Artifact of build number ${latestBuild.buildNumber} downloaded at ${artifactDirPath}`);
            });
        });
    }
}
exports.ArtifactDownloader = ArtifactDownloader;
