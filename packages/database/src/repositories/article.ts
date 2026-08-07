import { db } from "../connection";
import { articleTable, articleTagsTable } from "../schema/article";
import { eq } from "drizzle-orm";
import { Article } from "@mrerr/domain";
import { PublishableRepository } from "./base";
import {
  NotFoundError,
  ValidationFailureError,
  RelationshipReferenceError,
  handlePostgresError,
  mapValidationError,
} from "./errors";
import {
  articleSchema,
  createArticleInputSchema,
  updateArticleInputSchema,
} from "@mrerr/domain/src/article/schema";

export class ArticleRepository implements PublishableRepository<
  Article.Article,
  Omit<Article.Article, "id" | "createdAt" | "updatedAt">,
  Partial<Omit<Article.Article, "id" | "createdAt" | "updatedAt">>
> {
  private validate(
    data: unknown,
    boundary: "domain-to-database" | "database-to-domain" = "database-to-domain",
    operation?: string,
  ): Article.Article {
    const result = articleSchema(data);
    if (result instanceof Error) {
      throw mapValidationError(result, "database-to-domain", "Article");
    }
    return result as Article.Article;
  }

  private async enrichArticlesWithTags(articles: any[]): Promise<Article.Article[]> {
    if (articles.length === 0) return [];
    const articleIds = articles.map((a) => a.id);

    const relRows = await db
      .select({
        articleId: articleTagsTable.articleId,
        slug: tagTable.slug,
      })
      .from(articleTagsTable)
      .innerJoin(tagTable, eq(articleTagsTable.tagId, tagTable.id))
      .where(inArray(articleTagsTable.articleId, articleIds));

    const tagMap = new Map<string, string[]>();
    for (const r of relRows) {
      const list = tagMap.get(r.articleId) || [];
      list.push(r.slug);
      tagMap.set(r.articleId, list);
    }

    const enriched = articles.map((a) => ({
      ...a,
      tags: tagMap.get(a.id) || [],
    }));

    return enriched.map((a) => this.validate(a, "database-to-domain"));
  }

  async find(): Promise<Article.Article[]> {
    try {
      const rows = await db.select().from(articleTable);
      return rows.map((r) => this.validate(r));
    } catch (e) {
      handlePostgresError(e, "Article");
    }
  }

  async list(options?: { publishedOnly?: boolean }): Promise<Article.Article[]> {
    try {
      let query = db.select().from(articleTable);
      if (options?.publishedOnly) {
        query = query.where(eq(articleTable.isPublished, true)) as any;
      }
      const rows = await query;
      return rows.map((r) => this.validate(r));
    } catch (e) {
      handlePostgresError(e, "Article");
    }
  }

  async findById(id: string): Promise<Article.Article | null> {
    try {
      const rows = await db.select().from(articleTable).where(eq(articleTable.id, id)).limit(1);
      if (rows.length === 0) return null;
      return this.validate(rows[0]);
    } catch (e) {
      handlePostgresError(e, "Article");
    }
  }

  async create(
    data: Omit<Article.Article, "id" | "createdAt" | "updatedAt">,
  ): Promise<Article.Article> {
    try {
      const rows = await db.select().from(articleTable).where(eq(articleTable.slug, slug)).limit(1);
      if (rows.length === 0) return null;
      const [enriched] = await this.enrichArticlesWithTags(rows);
      return enriched;
    } catch (e) {
      handlePostgresError(e, "Article");
    }
  }

  async create(data: Article.CreateArticleInput): Promise<Article.Article> {
    const validatedInput = createArticleInputSchema(data);
    if (validatedInput instanceof Error) {
      throw mapValidationError(validatedInput, "domain-to-database", "Article", "create");
    }
    const input = validatedInput as Article.CreateArticleInput;

    try {
      return await db.transaction(async (tx) => {
        const [row] = await tx.insert(articleTable).values(insertData).returning();
        return this.validate(row);
      });
    } catch (e) {
      handlePostgresError(e, "Article");
    }
  }

  async update(id: string, data: Article.UpdateArticleInput): Promise<Article.Article> {
    const validatedInput = updateArticleInputSchema(data);
    if (validatedInput instanceof Error) {
      throw mapValidationError(validatedInput, "domain-to-database", "Article", "update");
    }
    const input = validatedInput as Article.UpdateArticleInput;

    try {
      return await db.transaction(async (tx) => {
        const [existingRow] = await tx
          .select()
          .from(articleTable)
          .where(eq(articleTable.id, id))
          .limit(1);
        if (!existingRow) {
          throw new NotFoundError("Article", id);
        }

        const existingTags = await tx
          .select({ slug: tagTable.slug })
          .from(articleTagsTable)
          .innerJoin(tagTable, eq(articleTagsTable.tagId, tagTable.id))
          .where(eq(articleTagsTable.articleId, id));

        const existingArticle = this.validate(
          {
            ...existingRow,
            tags: existingTags.map((t) => t.slug),
          },
          "database-to-domain",
          "update",
        );

        const mergedCandidate: any = {
          ...existingArticle,
          ...input,
          updatedAt: new Date(),
        };

        const targetTagSlugs =
          input.tags !== undefined
            ? Array.from(new Set(input.tags.map((s) => s.trim())))
            : existingArticle.tags;

        mergedCandidate.tags = targetTagSlugs;

        const validatedEntity = articleSchema(mergedCandidate);
        if (validatedEntity instanceof Error) {
          throw mapValidationError(validatedEntity, "database-to-domain", "Article", "update");
        }

        let tagIds: string[] = [];
        if (input.tags !== undefined) {
          if (targetTagSlugs.length > 0) {
            for (const slug of targetTagSlugs) {
              if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
                throw new RelationshipReferenceError({
                  entity: "Article",
                  relationship: "tags",
                  missing: [slug],
                });
              }
            }

            const matchedTags = await tx
              .select({ id: tagTable.id, slug: tagTable.slug })
              .from(tagTable)
              .where(inArray(tagTable.slug, targetTagSlugs));

            const matchedSlugs = matchedTags.map((t) => t.slug);
            const missingSlugs = targetTagSlugs.filter((s) => !matchedSlugs.includes(s));

            if (missingSlugs.length > 0) {
              throw new RelationshipReferenceError({
                entity: "Article",
                relationship: "tags",
                missing: missingSlugs,
              });
            }

            tagIds = matchedTags.map((t) => t.id);
          }
        }

        const updatePayload: any = {
          title: mergedCandidate.title,
          slug: mergedCandidate.slug,
          excerpt: mergedCandidate.excerpt,
          content: mergedCandidate.content,
          coverImage: mergedCandidate.coverImage,
          status: mergedCandidate.status,
          isPublished: mergedCandidate.isPublished,
          publishedAt: mergedCandidate.publishedAt,
          updatedAt: mergedCandidate.updatedAt,
        };

      const [row] = await db
        .update(articleTable)
        .set(updateData)
        .where(eq(articleTable.id, id))
        .returning();

      if (!row) throw new NotFoundError("Article", id);
      return this.validate(row);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Article");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const [row] = await db.delete(articleTable).where(eq(articleTable.id, id)).returning();
      if (!row) throw new NotFoundError("Article", id);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Article");
    }
  }

  async publish(id: string): Promise<Article.Article> {
    try {
      const [row] = await db
        .update(articleTable)
        .set({ isPublished: true, publishedAt: new Date(), updatedAt: new Date() })
        .where(eq(articleTable.id, id))
        .returning();

      if (!row) throw new NotFoundError("Article", id);
      return this.validate(row);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Article");
    }
  }

  async archive(id: string): Promise<Article.Article> {
    try {
      const [row] = await db
        .update(articleTable)
        .set({ isPublished: false, updatedAt: new Date() })
        .where(eq(articleTable.id, id))
        .returning();

      if (!row) throw new NotFoundError("Article", id);
      return this.validate(row);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Article");
    }
  }

  async setTags(articleId: string, tagIds: string[]): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        await tx.delete(articleTagsTable).where(eq(articleTagsTable.articleId, articleId));

        if (tagIds.length > 0) {
          const values = tagIds.map((id) => ({ articleId, tagId: id }));
          await tx.insert(articleTagsTable).values(values);
        }
      });
    } catch (e) {
      handlePostgresError(e, "ArticleTags");
    }
  }
}
