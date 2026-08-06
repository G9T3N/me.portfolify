import { db } from "../connection";
import { projectTable, projectTechnologiesTable, technologyTable } from "../schema/project";
import { eq } from "drizzle-orm";
import { Project } from "@mrerr/domain";
import { PublishableRepository } from "./base";
import { NotFoundError, ValidationFailureError, handlePostgresError } from "./errors";

const { projectSchema } = Project;

export class ProjectRepository implements PublishableRepository<Project.Project, Omit<Project.Project, 'id' | 'createdAt' | 'updatedAt'>, Partial<Omit<Project.Project, 'id' | 'createdAt' | 'updatedAt'>>> {

  private async enrichWithTechnologies(projectRow: typeof projectTable.$inferSelect): Promise<unknown> {
    const techRows = await db
      .select({ slug: technologyTable.slug })
      .from(projectTechnologiesTable)
      .innerJoin(technologyTable, eq(projectTechnologiesTable.technologyId, technologyTable.id))
      .where(eq(projectTechnologiesTable.projectId, projectRow.id));

    return {
      ...projectRow,
      technologies: techRows.map(t => t.slug),
    };
  }

  private validate(data: unknown): Project.Project {
    const result = projectSchema(data);
    if (result instanceof Error) {
        throw new ValidationFailureError("Invalid project data", result.message);
    }
    return result as Project.Project;
  }

  async find(): Promise<Project.Project[]> {
    try {
      const rows = await db.select().from(projectTable);
      const enriched = await Promise.all(rows.map(r => this.enrichWithTechnologies(r)));
      return enriched.map(e => this.validate(e));
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
      const enriched = await Promise.all(rows.map(r => this.enrichWithTechnologies(r)));
      return enriched.map(e => this.validate(e));
    } catch (e) {
      handlePostgresError(e, "Project");
    }
  }

  async findById(id: string): Promise<Project.Project | null> {
    try {
      const rows = await db.select().from(projectTable).where(eq(projectTable.id, id)).limit(1);
      if (rows.length === 0) return null;
      const enriched = await this.enrichWithTechnologies(rows[0]);
      return this.validate(enriched);
    } catch (e) {
      handlePostgresError(e, "Project");
    }
  }

  async create(data: Omit<Project.Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project.Project> {
    try {
      const insertData = {
          title: data.title,
          slug: data.slug,
          summary: data.summary,
          description: data.description,
          status: data.status,
          featured: data.featured,
          images: (data.images || []) as string[],
          repository: data.repository ?? null,
          demo: data.demo ?? null,
          isPublished: data.isPublished ?? false,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      };

      return await db.transaction(async (tx) => {
        const [row] = await tx.insert(projectTable).values(insertData).returning();

        // Persist technology associations if provided
        if (data.technologies && data.technologies.length > 0) {
          // For simplicity, we'll look up each technology
          const techIds: string[] = [];
          for (const techSlug of data.technologies) {
            const [tech] = await tx
              .select({ id: technologyTable.id })
              .from(technologyTable)
              .where(eq(technologyTable.slug, techSlug))
              .limit(1);
            if (tech) {
              techIds.push(tech.id);
            }
          }

          if (techIds.length > 0) {
            const values = techIds.map(techId => ({
              projectId: row.id,
              technologyId: techId,
            }));
            await tx.insert(projectTechnologiesTable).values(values);
          }
        }

        const enriched = await this.enrichWithTechnologies(row);
        return this.validate(enriched);
      });
    } catch (e) {
      handlePostgresError(e, "Project");
    }
  }

  async update(id: string, data: Partial<Omit<Project.Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project.Project> {
    try {
      const updateData = { ...data, updatedAt: new Date() } as any;

      const [row] = await db.update(projectTable)
        .set(updateData)
        .where(eq(projectTable.id, id))
        .returning();

      if (!row) throw new NotFoundError("Project", id);
      const enriched = await this.enrichWithTechnologies(row);
      return this.validate(enriched);
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
      const [row] = await db.update(projectTable)
        .set({ isPublished: true, publishedAt: new Date(), updatedAt: new Date() })
        .where(eq(projectTable.id, id))
        .returning();

      if (!row) throw new NotFoundError("Project", id);
      const enriched = await this.enrichWithTechnologies(row);
      return this.validate(enriched);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Project");
    }
  }

  async archive(id: string): Promise<Project.Project> {
    try {
      const [row] = await db.update(projectTable)
        .set({ isPublished: false, updatedAt: new Date() })
        .where(eq(projectTable.id, id))
        .returning();

      if (!row) throw new NotFoundError("Project", id);
      const enriched = await this.enrichWithTechnologies(row);
      return this.validate(enriched);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      handlePostgresError(e, "Project");
    }
  }

  // Example atomic relation mapping
  async setTechnologies(projectId: string, technologyIds: string[]): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        await tx.delete(projectTechnologiesTable).where(eq(projectTechnologiesTable.projectId, projectId));

        if (technologyIds.length > 0) {
          const values = technologyIds.map(id => ({ projectId, technologyId: id }));
          await tx.insert(projectTechnologiesTable).values(values);
        }
      });
    } catch (e) {
      handlePostgresError(e, "ProjectTechnologies");
    }
  }
}
