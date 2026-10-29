import { z } from "zod";

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_AVATAR_MB = 2;
export const MAX_BANNER_MB = 5;

/** Arquivo de imagem opcional (null = não enviado), validado por tipo e tamanho. */
export function imageSchema(maxMb: number) {
  return z
    .custom<File | null>(
      (value) => value === null || (typeof File !== "undefined" && value instanceof File),
    )
    .refine(
      (file) => file === null || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Use uma imagem PNG, JPG ou WEBP.",
    )
    .refine(
      (file) => file === null || file.size <= maxMb * 1024 * 1024,
      `A imagem deve ter no máximo ${maxMb} MB.`,
    );
}

/** Só arquivos de tipo aceito podem ser pré-visualizados. */
export function isPreviewable(file: File | null): file is File {
  return file !== null && ACCEPTED_IMAGE_TYPES.includes(file.type);
}
