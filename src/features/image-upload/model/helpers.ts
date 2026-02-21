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

  if (file.size > 100 * 1024 * 1024) {
    // 100MB
    notify.error("Max 100MB");
    return false;
  }

  return true;
};

export const normalizeImageFile = async (
  file: File
): Promise<{ blob: Blob; filename: string }> => {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (!isHeic) {
    // Если это обычный PNG/JPG/WEBP, просто отдаем как есть
    return { blob: file, filename: file.name };
  }

  try {
    // Конвертируем HEIC в JPEG прямо в браузере
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9, // Отличное качество при адекватном весе
    });

    // heic2any может вернуть массив (если в HEIC зашита анимация или серия фото)
    const finalBlob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    // Меняем расширение в имени файла
    const newFilename = file.name.replace(/\.heic|\.heif/i, ".jpg");

    return { blob: finalBlob, filename: newFilename };
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    throw new Error(
      "Failed to decode HEIC image. The file might be corrupted."
    );
  }
};
