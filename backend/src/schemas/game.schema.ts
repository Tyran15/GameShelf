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

  platformId: z.number(),

  genreId: z.number(),
});