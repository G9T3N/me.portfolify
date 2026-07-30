import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ArticleRepository } from "./article";
import { db } from "../connection";
import { articleTable, tagTable, articleTagsTable } from "../schema/article";
import { eq } from "drizzle-orm";
import { DuplicateError, NotFoundError, ValidationFailureError } from "./errors";

describe("ArticleRepository", () => {
  const repo = new ArticleRepository();

  beforeAll(async () => {
    // Clear relevant tables before tests
    await db.delete(articleTagsTable);
    await db.delete(articleTable);
    await db.delete(tagTable);
  });

  afterAll(async () => {
    const connection = (global as any).__db_connection__;
    if (connection) {
      await connection.end();
    }
  });

  it("should create and retrieve an article round-trip", async () => {
    const art = await repo.create({
      title: "Test Article",
      slug: "test-article",
      excerpt: "An excerpt",
      content: "Content of the article",
      status: "draft",
      tags: [],
      isPublished: false,
      publishedAt: null,
      coverImage: null,
    });

    expect(art).toBeDefined();
    expect(art.id).toBeDefined();
    expect(art.slug).toBe("test-article");

    const fetched = await repo.findById(art.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(art.id);
    expect(fetched?.tags).toEqual([]);
  });

  it("should enforce validation through ArkType on creation", async () => {
    await expect(
      repo.create({
        title: "", // Invalid empty title
        slug: "invalid-art",
        excerpt: "An excerpt",
        content: "Content",
        status: "draft",
        tags: [],
        isPublished: false,
        publishedAt: null,
        coverImage: null,
      }),
    ).rejects.toThrow(ValidationFailureError);
  });

  it("should throw DuplicateError on slug collision", async () => {
    await expect(
      repo.create({
        title: "Another Article",
        slug: "test-article", // Duplicate slug
        excerpt: "An excerpt",
        content: "Content",
        status: "draft",
        tags: [],
        isPublished: false,
        publishedAt: null,
        coverImage: null,
      }),
    ).rejects.toThrow(DuplicateError);
  });

  it("should throw NotFoundError when updating non-existent article", async () => {
    await expect(
      repo.update("00000000-0000-0000-0000-000000000000", { title: "New" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("should write relationships atomically in transaction", async () => {
    const art = await repo.create({
      title: "Rel Article",
      slug: "rel-article",
      excerpt: "Excerpt",
      content: "Content",
      status: "draft",
      tags: [],
      isPublished: false,
      publishedAt: null,
      coverImage: null,
    });

    const [tag] = await db
      .insert(tagTable)
      .values({
        name: "Architecture",
        slug: "architecture",
      })
      .returning();

    await repo.setTags(art.id, [tag.id]);

    const relations = await db
      .select()
      .from(articleTagsTable)
      .where(eq(articleTagsTable.articleId, art.id));
    expect(relations.length).toBe(1);
    expect(relations[0].tagId).toBe(tag.id);
  });

  it("should hard delete article and atomic relationships cleanly", async () => {
    const art = await repo.create({
      title: "To Delete",
      slug: "to-delete",
      excerpt: "Excerpt",
      content: "Content",
      status: "draft",
      tags: [],
      isPublished: false,
      publishedAt: null,
      coverImage: null,
    });

    await repo.delete(art.id);

    const fetched = await repo.findById(art.id);
    expect(fetched).toBeNull();
  });
});
