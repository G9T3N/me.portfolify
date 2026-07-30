import {
  type articleSchema,
  type createArticleInputSchema,
  type updateArticleInputSchema,
} from "./schema";

export type Article = typeof articleSchema.infer;
export type CreateArticleInput = typeof createArticleInputSchema.infer;
export type UpdateArticleInput = typeof updateArticleInputSchema.infer;
