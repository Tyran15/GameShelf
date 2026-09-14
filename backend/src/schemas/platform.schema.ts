import { z } from "zod";

export const createPlatformSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
});

export const updatePlatformSchema = createPlatformSchema.partial();