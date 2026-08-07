import { db } from "../connection";
import { projectTable, projectTechnologiesTable } from "../schema/project";
import { eq } from "drizzle-orm";
import { Project } from "@mrerr/domain";
import { PublishableRepository } from "./base";
import {
  NotFoundError,
  ValidationFailureError,
  RelationshipReferenceError,
  handlePostgresError,
  mapValidationError,
} from "./errors";
import {
  projectSchema,
  createProjectInputSchema,
  updateProjectInputSchema,
} from "@mrerr/domain/src/project/schema";

export class ProjectRepository implements PublishableRepository<
  Project.Project,
  Omit<Project.Project, "id" | "createdAt" | "updatedAt">,
  Partial<Omit<Project.Project, "id" | "createdAt" | "updatedAt">>
> {
  private validate(
    data: unknown,
    boundary: "domain-to-database" | "database-to-domain" = "database-to-domain",
    operation?: string,
  ): Project.Project {
    const result = projectSchema(data);
    if (result instanceof Error) {
      throw mapValidationError(result, "database-to-domain", "Project");
    }
    return result as Project.Project;
  }

  private async enrichProjectsWithTechnologies(projects: any[]): Promise<Project.Project[]> {
    if (projects.length === 0) return [];
    const projectIds = projects.map((p) => p.id);

    const relRows = await db
      .select({
        projectId: projectTechnologiesTable.projectId,
        slug: technologyTable.slug,
      })
      .from(projectTechnologiesTable)
      .innerJoin(technologyTable, eq(projectTechnologiesTable.technologyId, technologyTable.id))
      .where(inArray(projectTechnologiesTable.projectId, projectIds));

    const techMap = new Map<string, string[]>();
    for (const r of relRows) {
      const list = techMap.get(r.projectId) || [];
      list.push(r.slug);
      techMap.set(r.projectId, list);
    }

    const enriched = projects.map((p) => ({
      ...p,
      technologies: techMap.get(p.id) || [],
    }));

    return enriched.map((p) => this.validate(p, "database-to-domain"));
  }

  async find(): Promise<Project.Project[]> {
    try {
      const rows = await db.select().from(projectTable);
      return rows.map((r) => this.validate(r));
    } catch (e) {
      handlePostgresError(e, "Project");
    }
  }

  async list(options?: { publishedOnly?: boolean }): Promise<Project.Project[]> {
    try {
      let query = db.select().from(projectTable);
      if (options?.publishedOnly) {
        query = query.where(eq(projectTable.isPublished, true)) as any;
      }
      const rows = await query;
      return rows.map((r) => this.validate(r));
    } catch (e) {
      handlePostgresError(e, "Project");
    }
  }

  async findById(id: string): Promise<Project.Project | null> {
    try {
      const rows = await db.select().from(projectTable).where(eq(projectTable.id, id)).limit(1);
      if (rows.length === 0) return null;
      return this.validate(rows[0]);
    } catch (e) {
      handlePostgresError(e, "Project");
    }
  }

  async create(
    data: Omit<Project.Project, "id" | "createdAt" | "updatedAt">,
  ): Promise<Project.Project> {
    try {
      const rows = await db.select().from(projectTable).where(eq(projectTable.slug, slug)).limit(1);
      if (rows.length === 0) return null;
      const [enriched] = await this.enrichProjectsWithTechnologies(rows);
      return enriched;
    } catch (e) {
      handlePostgresError(e, "Project");
    }
  }

  async create(data: Project.CreateProjectInput): Promise<Project.Project> {
    const validatedInput = createProjectInputSchema(data);
    if (validatedInput instanceof Error) {
      throw mapValidationError(validatedInput, "domain-to-database", "Project", "create");
    }
    const input = validatedInput as Project.CreateProjectInput;

      return await db.transaction(async (tx) => {
        const [row] = await tx.insert(projectTable).values(insertData).returning();
        return this.validate(row);
      });
    } catch (e) {
      handlePostgresError(e, "Project");
    }
  }

  async update(id: string, data: Project.UpdateProjectInput): Promise<Project.Project> {
    const validatedInput = updateProjectInputSchema(data);
    if (validatedInput instanceof Error) {
      throw mapValidationError(validatedInput, "domain-to-database", "Project", "update");
    }
    const input = validatedInput as Project.UpdateProjectInput;

    try {
      return await db.transaction(async (tx) => {
        const [existingRow] = await tx
          .select()
          .from(projectTable)
          .where(eq(projectTable.id, id))
          .limit(1);
        if (!existingRow) {
          throw new NotFoundError("Project", id);
        }

        const existingTechs = await tx
          .select({ slug: technologyTable.slug })
          .from(projectTechnologiesTable)
          .innerJoin(technologyTable, eq(projectTechnologiesTable.technologyId, technologyTable.id))
          .where(eq(projectTechnologiesTable.projectId, id));

        const existingProject = this.validate(
          {
            ...existingRow,
            technologies: existingTechs.map((t) => t.slug),
          },
          "database-to-domain",
          "update",
        );

        const mergedCandidate: any = {
          ...existingProject,
          ...input,
          updatedAt: new Date(),
        };

        const targetTechSlugs =
          input.technologies !== undefined
            ? Array.from(new Set(input.technologies.map((s) => s.trim())))
            : existingProject.technologies;

        mergedCandidate.technologies = targetTechSlugs;

        const validatedEntity = projectSchema(mergedCandidate);
        if (validatedEntity instanceof Error) {
          throw mapValidationError(validatedEntity, "database-to-domain", "Project", "update");
        }

        let techIds: string[] = [];
        if (input.technologies !== undefined) {
          if (targetTechSlugs.length > 0) {
            for (const slug of targetTechSlugs) {
              if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
                throw new RelationshipReferenceError({
                  entity: "Project",
                  relationship: "technologies",
                  missing: [slug],
                });
              }
            }

            const matchedTechs = await tx
              .select({ id: technologyTable.id, slug: technologyTable.slug })
              .from(technologyTable)
              .where(inArray(technologyTable.slug, targetTechSlugs));

            const matchedSlugs = matchedTechs.map((t) => t.slug);
            const missingSlugs = targetTechSlugs.filter((s) => !matchedSlugs.includes(s));

            if (missingSlugs.length > 0) {
              throw new RelationshipReferenceError({
                entity: "Project",
                relationship: "technologies",
                missing: missingSlugs,
              });
            }

            techIds = matchedTechs.map((t) => t.id);
          }
        }

        const updatePayload: any = {
          title: mergedCandidate.title,
          slug: mergedCandidate.slug,
          summary: mergedCandidate.summary,
          description: mergedCandidate.description,
          status: mergedCandidate.status,
          featured: mergedCandidate.featured,
          images: mergedCandidate.images,
          repository: mergedCandidate.repository,
          demo: mergedCandidate.demo,
          isPublished: mergedCandidate.isPublished,
          publishedAt: mergedCandidate.publishedAt,
          updatedAt: mergedCandidate.updatedAt,
        };

      const [row] = await db
        .update(projectTable)
        .set(updateData)
        .where(eq(projectTable.id, id))
        .returning();

      if (!row) throw new NotFoundError("Project", id);
      return this.validate(row);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Project");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const [row] = await db.delete(projectTable).where(eq(projectTable.id, id)).returning();
      if (!row) throw new NotFoundError("Project", id);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Project");
    }
  }

  async publish(id: string): Promise<Project.Project> {
    try {
      const [row] = await db
        .update(projectTable)
        .set({ isPublished: true, publishedAt: new Date(), updatedAt: new Date() })
        .where(eq(projectTable.id, id))
        .returning();

      if (!row) throw new NotFoundError("Project", id);
      return this.validate(row);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Project");
    }
  }

  async archive(id: string): Promise<Project.Project> {
    try {
      const [row] = await db
        .update(projectTable)
        .set({ isPublished: false, updatedAt: new Date() })
        .where(eq(projectTable.id, id))
        .returning();

      if (!row) throw new NotFoundError("Project", id);
      return this.validate(row);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Project");
    }
  }

  // Example atomic relation mapping
  async setTechnologies(projectId: string, technologyIds: string[]): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        await tx
          .delete(projectTechnologiesTable)
          .where(eq(projectTechnologiesTable.projectId, projectId));

        if (technologyIds.length > 0) {
          const values = technologyIds.map((id) => ({ projectId, technologyId: id }));
          await tx.insert(projectTechnologiesTable).values(values);
        }
      });
    } catch (e) {
      handlePostgresError(e, "ProjectTechnologies");
    }
  }
}
