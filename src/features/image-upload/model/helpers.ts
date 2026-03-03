import { notify } from "@/shared/lib/notifications";
import heic2any from "heic2any";

export const validateImage = (file: File): boolean => {
  const isHeicExt =
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (!file.type.startsWith("image/") && !isHeicExt) {
    notify.error("Only images allowed");
    return false;
  }

  if (file.size > 20 * 1024 * 1024) {
    notify.error("File too large", "Maximum upload size is 20MB.");
    return false;
  }

  return true;
};

export const normalizeImageFile = async (
  file: File
): Promise<{ blob: Blob; filename: string; size: number }> => {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (!isHeic) {
    return { blob: file, filename: file.name, size: file.size };
  }

  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });

    const finalBlob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    const newFilename = file.name.replace(/\.heic|\.heif/i, ".jpg");

    return { blob: finalBlob, filename: newFilename, size: file.size };
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    throw new Error(
      "Failed to decode HEIC image. The file might be corrupted."
    );
  }
};
