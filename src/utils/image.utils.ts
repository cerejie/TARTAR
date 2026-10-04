const avatarSize = 256;
const avatarType = "image/webp";
const avatarQuality = 0.85;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export const avatarAcceptedTypes: readonly string[] = acceptedImageTypes;

const unreadableImageMessage = "That file could not be read as an image. Choose a JPG, PNG or WebP.";

const canvasBlobOf = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(unreadableImageMessage))),
      avatarType,
      avatarQuality
    );
  });

export const toAvatarImage = async (file: File): Promise<Blob> => {
  if (!avatarAcceptedTypes.includes(file.type)) throw new Error(unreadableImageMessage);

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error(unreadableImageMessage);
  });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = avatarSize;
  canvas.height = avatarSize;

  const context = canvas.getContext("2d");
  if (!context) throw new Error(unreadableImageMessage);

  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    avatarSize,
    avatarSize
  );
  bitmap.close();

  return canvasBlobOf(canvas);
};
