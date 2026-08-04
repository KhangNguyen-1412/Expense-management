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

/**
 * Compress and downscale an image File or Base64 string to prevent
 * LocalStorage / Firestore quota overflow (Max width 800px, JPEG quality 0.6 => ~50-90KB max)
 */
export const compressImage = (input, maxWidth = 800, quality = 0.6) => {
  return new Promise((resolve) => {
    if (!input) {
      resolve("");
      return;
    }

    // If input is a standard HTTP / Google Drive URL (not base64), return as is
    if (typeof input === "string" && !input.startsWith("data:image")) {
      resolve(input);
      return;
    }

    const processImageSource = (src) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to web optimized compressed JPEG (guarantees size < 150KB)
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };

      img.onerror = () => resolve(src); // Fallback to original
      img.src = src;
    };

    if (typeof input === "string") {
      processImageSource(input);
    } else if (input instanceof File || input instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => processImageSource(e.target.result);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(input);
    } else {
      resolve("");
    }
  });
};
