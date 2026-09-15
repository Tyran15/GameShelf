import { z } from "zod";

export const createGameSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),

  description: z.string().optional(),

  coverUrl: z.string().optional(),

  releaseDate: z.string().optional(),

  status: z
    .enum([
      "WISHLIST",
      "PLAYING",
      "COMPLETED",
      "PAUSED",
      "DROPPED",
    ])
    .optional(),

  rating: z
    .number()
    .min(0)
    .max(10)
    .optional(),

  platformId: z.coerce.number(),
  genreId: z.coerce.number(),
});

export const updateGameSchema = createGameSchema.partial();

export const gameQuerySchema = z.object({
  status: z
    .enum(["WISHLIST", "PLAYING", "COMPLETED", "PAUSED", "DROPPED"])
    .optional(),

  platformId: z.coerce.number().int().positive().optional(),

  genreId: z.coerce.number().int().positive().optional(),

  search: z.string().trim().min(1).optional(),
});