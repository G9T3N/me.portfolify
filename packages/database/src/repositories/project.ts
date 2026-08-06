import { db } from "../connection";
import { projectTable, projectTechnologiesTable, technologyTable } from "../schema/project";
import { eq, inArray } from "drizzle-orm";
import { Project } from "@mrerr/domain";
import { PublishableRepository } from "./base";
import {
  NotFoundError,
  ValidationFailureError,
  RelationshipReferenceError,
  handlePostgresError,
  mapValidationError,
  isArkErrors,
} from "./errors";
import {
  projectSchema,
  createProjectInputSchema,
  updateProjectInputSchema,
} from "@mrerr/domain/src/project/schema";

export class ProjectRepository implements PublishableRepository<
  Project.Project,
  Project.CreateProjectInput,
  Project.UpdateProjectInput
> {
  private validate(
    data: unknown,
    boundary: "domain-to-database" | "database-to-domain" = "database-to-domain",
    operation?: string,
  ): Project.Project {
    const result = projectSchema(data);
    if (isArkErrors(result)) {
      throw mapValidationError(result, boundary, "Project", operation);
    }
    if (result instanceof Error) {
      throw mapValidationError(result, boundary, "Project", operation);
    }
    return result as Project.Project;
  }

  private async enrichProjectsWithTechnologies(
    projects: (typeof projectTable.$inferSelect)[],
  ): Promise<Project.Project[]> {
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
      return await this.enrichProjectsWithTechnologies(rows);
    } catch (e) {
      if (e instanceof ValidationFailureError) {
        throw e;
      }
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
      return await this.enrichProjectsWithTechnologies(rows);
    } catch (e) {
      if (e instanceof ValidationFailureError) {
        throw e;
      }
      handlePostgresError(e, "Project");
    }
  }

  async findById(id: string): Promise<Project.Project | null> {
    try {
      const rows = await db.select().from(projectTable).where(eq(projectTable.id, id)).limit(1);
      if (rows.length === 0) return null;
      const [enriched] = await this.enrichProjectsWithTechnologies(rows);
      return enriched;
    } catch (e) {
      if (e instanceof ValidationFailureError) {
        throw e;
      }
      handlePostgresError(e, "Project");
    }
  }

  async findBySlug(slug: string): Promise<Project.Project | null> {
    try {
      const rows = await db.select().from(projectTable).where(eq(projectTable.slug, slug)).limit(1);
      if (rows.length === 0) return null;
      const [enriched] = await this.enrichProjectsWithTechnologies(rows);
      return enriched;
    } catch (e) {
      if (e instanceof ValidationFailureError) {
        throw e;
      }
      handlePostgresError(e, "Project");
    }
  }

  async create(data: Project.CreateProjectInput): Promise<Project.Project> {
    const validatedInput = createProjectInputSchema(data);
    if (isArkErrors(validatedInput)) {
      throw mapValidationError(validatedInput, "domain-to-database", "Project", "create");
    }
    if (validatedInput instanceof Error) {
      throw mapValidationError(validatedInput, "domain-to-database", "Project", "create");
    }
    const input = validatedInput as Project.CreateProjectInput;

    try {
      return await db.transaction(async (tx) => {
        const techSlugs = Array.from(new Set((input.technologies || []).map((s) => s.trim())));
        let techIds: string[] = [];

        if (techSlugs.length > 0) {
          for (const slug of techSlugs) {
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
            .where(inArray(technologyTable.slug, techSlugs));

          const matchedSlugs = matchedTechs.map((t) => t.slug);
          const missingSlugs = techSlugs.filter((s) => !matchedSlugs.includes(s));

          if (missingSlugs.length > 0) {
            throw new RelationshipReferenceError({
              entity: "Project",
              relationship: "technologies",
              missing: missingSlugs,
            });
          }

          techIds = matchedTechs.map((t) => t.id);
        }

        const insertData = {
          title: input.title,
          slug: input.slug,
          summary: input.summary,
          description: input.description,
          status: input.status,
          featured: input.featured ?? false,
          images: input.images || [],
          repository: input.repository ?? null,
          demo: input.demo ?? null,
          isPublished: input.isPublished ?? false,
          publishedAt: input.publishedAt ?? null,
        };

        const [row] = await tx.insert(projectTable).values(insertData).returning();

        if (techIds.length > 0) {
          const relationValues = techIds.map((tId) => ({
            projectId: row.id,
            technologyId: tId,
          }));
          await tx.insert(projectTechnologiesTable).values(relationValues);
        }

        const persistedCandidate = {
          ...row,
          technologies: techSlugs,
        };

        return this.validate(persistedCandidate, "database-to-domain", "create");
      });
    } catch (e) {
      if (e instanceof RelationshipReferenceError || e instanceof ValidationFailureError) {
        throw e;
      }
      handlePostgresError(e, "Project");
    }
  }

  async update(id: string, data: Project.UpdateProjectInput): Promise<Project.Project> {
    const validatedInput = updateProjectInputSchema(data);
    if (isArkErrors(validatedInput)) {
      throw mapValidationError(validatedInput, "domain-to-database", "Project", "update");
    }
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
        if (isArkErrors(validatedEntity)) {
          throw mapValidationError(validatedEntity, "database-to-domain", "Project", "update");
        }
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

        const [row] = await tx
          .update(projectTable)
          .set(updatePayload)
          .where(eq(projectTable.id, id))
          .returning();

        if (input.technologies !== undefined) {
          await tx
            .delete(projectTechnologiesTable)
            .where(eq(projectTechnologiesTable.projectId, id));
          if (techIds.length > 0) {
            const relationValues = techIds.map((tId) => ({
              projectId: id,
              technologyId: tId,
            }));
            await tx.insert(projectTechnologiesTable).values(relationValues);
          }
        }

        const finalResult = {
          ...row,
          technologies: targetTechSlugs,
        };

        return this.validate(finalResult, "database-to-domain", "update");
      });
    } catch (e) {
      if (
        e instanceof NotFoundError ||
        e instanceof RelationshipReferenceError ||
        e instanceof ValidationFailureError
      ) {
        throw e;
      }
      handlePostgresError(e, "Project");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        await tx.delete(projectTechnologiesTable).where(eq(projectTechnologiesTable.projectId, id));
        const [row] = await tx.delete(projectTable).where(eq(projectTable.id, id)).returning();
        if (!row) throw new NotFoundError("Project", id);
      });
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

      const techs = await this.getTechnologiesForProject(id);
      return this.validate({ ...row, technologies: techs }, "database-to-domain", "publish");
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

      const techs = await this.getTechnologiesForProject(id);
      return this.validate({ ...row, technologies: techs }, "database-to-domain", "archive");
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Project");
    }
  }

  private async getTechnologiesForProject(projectId: string): Promise<string[]> {
    const rows = await db
      .select({ slug: technologyTable.slug })
      .from(projectTechnologiesTable)
      .innerJoin(technologyTable, eq(projectTechnologiesTable.technologyId, technologyTable.id))
      .where(eq(projectTechnologiesTable.projectId, projectId));
    return rows.map((r) => r.slug);
  }

  // Backward compatible but transaction-safe relation writer
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
