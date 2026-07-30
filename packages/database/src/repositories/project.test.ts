import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ProjectRepository } from "./project";
import { db } from "../connection";
import { projectTable, technologyTable, projectTechnologiesTable } from "../schema/project";
import { eq } from "drizzle-orm";
import { DuplicateError, NotFoundError, ValidationFailureError } from "./errors";

// Integration tests with the real database
describe("ProjectRepository", () => {
  const repo = new ProjectRepository();

  beforeAll(async () => {
    // Clear relevant tables before tests
    await db.delete(projectTechnologiesTable);
    await db.delete(projectTable);
    await db.delete(technologyTable);
  });

  afterAll(async () => {
    const connection = (global as any).__db_connection__;
    if (connection) {
      await connection.end();
    }
  });

  it("should create and retrieve a project", async () => {
    const proj = await repo.create({
      title: "Test Project",
      slug: "test-project",
      summary: "A test project",
      description: "Description of test project",
      status: "draft",
      featured: false,
      images: [],
      technologies: [],
      isPublished: false,
      publishedAt: null,
      repository: null,
      demo: null
    });

    expect(proj).toBeDefined();
    expect(proj.id).toBeDefined();
    expect(proj.slug).toBe("test-project");

    const fetched = await repo.findById(proj.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(proj.id);

    // ArkType schema validations
    expect(fetched?.images).toEqual([]);
  });

  it("should enforce validation through ArkType on creation", async () => {
    await expect(repo.create({
      title: "", // Invalid: length must be > 0
      slug: "invalid-project",
      summary: "A test project",
      description: "Description of test project",
      status: "draft",
      featured: false,
      images: [],
      technologies: [],
      isPublished: false,
      publishedAt: null,
      repository: null,
      demo: null
    })).rejects.toThrow(ValidationFailureError);
  });

  it("should throw DuplicateError on slug collision", async () => {
    // Rely on earlier inserted "test-project"
    await expect(repo.create({
      title: "Another Test Project",
      slug: "test-project", // Duplicate slug
      summary: "A test project",
      description: "Description of test project",
      status: "draft",
      featured: false,
      images: [],
      technologies: [],
      isPublished: false,
      publishedAt: null,
      repository: null,
      demo: null
    })).rejects.toThrow(DuplicateError);
  });

  it("should throw NotFoundError when updating non-existent project", async () => {
    await expect(repo.update("00000000-0000-0000-0000-000000000000", { title: "New" }))
      .rejects.toThrow(NotFoundError);
  });

  it("should write relationships atomically in transaction", async () => {
    const proj = await repo.create({
      title: "Rel Project",
      slug: "rel-project",
      summary: "A test project",
      description: "Description of test project",
      status: "draft",
      featured: false,
      images: [],
      technologies: [],
      isPublished: false,
      publishedAt: null,
      repository: null,
      demo: null
    });

    const [tech] = await db.insert(technologyTable).values({
      name: "Jest",
      slug: "jest"
    }).returning();

    await repo.setTechnologies(proj.id, [tech.id]);

    const relations = await db.select().from(projectTechnologiesTable).where(eq(projectTechnologiesTable.projectId, proj.id));
    expect(relations.length).toBe(1);
    expect(relations[0].technologyId).toBe(tech.id);
  });
});
