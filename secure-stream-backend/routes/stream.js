import {
    BlobServiceClient,
    generateBlobSASQueryParameters,
    BlobSASPermissions,
    SASProtocol,
    StorageSharedKeyCredential
} from "@azure/storage-blob";
import { Router } from "express";
import dotenv from "dotenv";
dotenv.config();
const router = Router();

// Utility: Generate Signed URL
const generateSASurl = (blobName) => {
    const accountName = process.env.AZURE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_ACCOUNT_KEY;
    const containerName = "videos";

    if (!accountName || !accountKey) {
        throw new Error("Azure account credentials are missing in .env file");
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 10 * 60 * 1000),
        protocol: SASProtocol.Https,
    }, sharedKeyCredential).toString();

    return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
};

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (id != "social") {
            return res.status(404).json({ msg: "Invalid video id" });
        }

        const streamLinks = {
            playlist: generateSASurl(`${id}.m3u8`),
            key: generateSASurl(`${id}.key`),
            segmentPrefix: generateSASurl(`${id}_000.ts`).split(`${id}_000.ts`)[0],
        };
        return res.json(streamLinks);
    } catch (error) {
        console.error("stream error", error);
        res.status(500).json({ msg: "Streaming Failed" });
    }
});
export default router;