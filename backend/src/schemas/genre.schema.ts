import { z } from "zod";

export const createGenreSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
});

export const updateGenreSchema = createGenreSchema.partial();