import { getSignedCloudFrontCookies } from "../utils/cloudfront2.js";

import { Song } from "../models/Song.js";
// import { getSignedUrl } from "../utils/s3.js";
import { getSignedCloudFrontUrl as getSignedUrl} from "../utils/cloudfront.js";
import { canStreamSong } from "../helpers/accessControl.js";
import { UnauthorizedError, NotFoundError } from "../errors/index.js";
import { Album } from "../models/Album.js";
import { canStreamAlbum } from "../helpers/accessControl.js";

export const streamSong2 = async (req, res) => {
  const { id: songId } = req.params;
  const userId = req.user._id;

  const allowed = await canStreamSong(userId, songId);
  if (!allowed) throw new UnauthorizedError("You do not have access to stream this song.");

  const song = await Song.findById(songId);
  if (!song || !song.audioKey) throw new NotFoundError("Song not found or missing audioKey");

  const baseUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${song.audioKey}/${song.audioKey}_hls.m3u8`;

  const signedCookies = getSignedCloudFrontCookies(song.audioKey);

  // Set CloudFront cookies
  res.cookie("CloudFront-Policy", signedCookies["CloudFront-Policy"], {
    httpOnly: true,
    secure: true,
    domain: process.env.COOKIE_DOMAIN, // e.g., ".yourdomain.com"
    path: "/",
  });
  res.cookie("CloudFront-Signature", signedCookies["CloudFront-Signature"], {
    httpOnly: true,
    secure: true,
    domain: process.env.COOKIE_DOMAIN,
    path: "/",
  });
  res.cookie("CloudFront-Key-Pair-Id", signedCookies["CloudFront-Key-Pair-Id"], {
    httpOnly: true,
    secure: true,
    domain: process.env.COOKIE_DOMAIN,
    path: "/",
  });

  res.json({ url: baseUrl });
};
