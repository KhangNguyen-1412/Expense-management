/**
 * Utility to convert standard Google Drive sharing URLs to direct CDN image URLs
 * e.g., https://drive.google.com/file/d/1A2B3C.../view?usp=sharing
 * -> https://lh3.googleusercontent.com/d/1A2B3C...
 */
export const convertGoogleDriveUrl = (url) => {
  if (!url || typeof url !== "string") return url;

  // Trim whitespace
  const trimmed = url.trim();

  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    return `https://lh3.googleusercontent.com/d/${matchFileD[1]}`;
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) {
    return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
  }

  return trimmed;
};
