import {
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { Router } from "express";
import dotenv from "dotenv";
import verifyToken from "../middlewares/auth.js";

dotenv.config();
const router = Router();

const accountName = process.env.AZURE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_ACCOUNT_KEY;
const containerName = "videos";

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const generateSASurl = (blobName) => {
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(Date.now() - 2 * 60 * 1000),
      expiresOn: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
      protocol: SASProtocol.Https,
    },
    sharedKeyCredential
  ).toString();

  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
};

const generateDynamicPlaylist = (segmentUrls, keyUrl) => {
  let playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-TARGETDURATION:12
#EXT-X-KEY:METHOD=AES-128,URI="${keyUrl}",IV=0x00000000000000000000000000000000
#EXT-X-MEDIA-SEQUENCE:0
`;

  segmentUrls.forEach(({ url, duration }) => {
    playlist += `#EXTINF:${duration},\n${url}\n`;
  });

  playlist += `#EXT-X-ENDLIST`;
  return playlist;
};

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ msg: "Video ID missing" });

    const totalSegments = 723; // 0 to 722
    const durations = [11.233, 9.8, 9.83, 9.43, 11.27]; // repeatable duration sample

    const segmentUrls = [];
    for (let i = 0; i < totalSegments; i++) {
      const blobName = `videos/social/stream${i}.ts`;
      segmentUrls.push({
        url: generateSASurl(blobName),
        duration: durations[i % durations.length],
      });
    }

    const keyUrl = generateSASurl(`videos/social/enc.key`);
    const playlist = generateDynamicPlaylist(segmentUrls, keyUrl);

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(playlist);
  } catch (err) {
    console.error(" Streaming error:", err);
    res.status(500).json({ msg: "Streaming Failed" });
  }
});

export default router;
