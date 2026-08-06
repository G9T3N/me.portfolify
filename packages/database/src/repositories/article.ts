import { db } from "../connection";
import { articleTable, articleTagsTable } from "../schema/article";
import { eq } from "drizzle-orm";
import { Article } from "@mrerr/domain";
import { PublishableRepository } from "./base";
import { NotFoundError, mapValidationError, handlePostgresError } from "./errors";
import { articleSchema } from "@mrerr/domain/src/article/schema";

export class ArticleRepository implements PublishableRepository<
  Article.Article,
  Omit<Article.Article, "id" | "createdAt" | "updatedAt">,
  Partial<Omit<Article.Article, "id" | "createdAt" | "updatedAt">>
> {
  private validate(data: unknown): Article.Article {
    // Supply the missing tags field before validation
    const candidate = {
      ...data,
      tags: [],
    };
    const result = articleSchema(candidate);
    if (result instanceof Error) {
      throw mapValidationError(result, "database-to-domain", "Article");
    }
    return result as Article.Article;
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
      const insertData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        status: data.status,
        coverImage: data.coverImage ?? null,
        isPublished: data.isPublished ?? false,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      };

      return await db.transaction(async (tx) => {
        const [row] = await tx.insert(articleTable).values(insertData).returning();
        return this.validate(row);
      });
    } catch (e) {
      handlePostgresError(e, "Article");
    }
  }

  async update(
    id: string,
    data: Partial<Omit<Article.Article, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Article.Article> {
    try {
      // Build updateData from only fields defined by articleTable
      const updateData: Partial<typeof articleTable.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (data.title !== undefined) updateData.title = data.title;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
      if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
      if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;

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
