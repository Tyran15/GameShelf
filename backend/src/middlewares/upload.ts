import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";

export const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const MAX_BANNER_BYTES = 5 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination(_req, file, cb) {
    const dir = path.join(UPLOAD_ROOT, file.fieldname === "avatar" ? "avatars" : "banners");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  // Nome aleatório: nunca usamos o nome enviado pelo cliente.
  filename(_req, file, cb) {
    cb(null, `${randomUUID()}${EXT_BY_MIME[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BANNER_BYTES, files: 2 },
  fileFilter(_req, file, cb) {
    if (file.mimetype in EXT_BY_MIME) cb(null, true);
    else cb(new Error("Use uma imagem PNG, JPG ou WEBP."));
  },
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

/** Roda o multer e transforma os erros dele em respostas JSON. */
export function handleProfileUpload(req: Request, res: Response, next: NextFunction) {
  upload(req, res, (error: unknown) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Imagem muito grande." });
    }
    const message = error instanceof Error ? error.message : "Falha no upload.";
    return res.status(400).json({ message });
  });
}

export async function removeUploadedFiles(files: Array<Express.Multer.File | undefined>) {
  await Promise.all(
    files
      .filter((file): file is Express.Multer.File => Boolean(file))
      .map((file) => fs.promises.unlink(file.path).catch(() => undefined)),
  );
}

/**
 * Apaga uma imagem salva a partir da URL pública ("/uploads/avatars/<arquivo>").
 * Só mexe em /uploads/avatars e /uploads/banners e usa apenas o nome do arquivo,
 * então um valor estranho no banco nunca aponta para fora da pasta de uploads.
 */
export async function removeUploadedByUrl(url: string | null | undefined) {
  if (!url) return;
  const match = /^\/uploads\/(avatars|banners)\/([^/\\]+)$/.exec(url);
  if (!match) return;
  await fs.promises.unlink(path.join(UPLOAD_ROOT, match[1]!, match[2]!)).catch(() => undefined);
}
