import { db } from "../connection";
import { projectTable, projectTechnologiesTable } from "../schema/project";
import { eq } from "drizzle-orm";
import { Project } from "@mrerr/domain";
import { PublishableRepository } from "./base";
import { NotFoundError, ValidationFailureError, handlePostgresError } from "./errors";
import { projectSchema } from "@mrerr/domain/src/project/schema";

export class ProjectRepository implements PublishableRepository<Project.Project, Omit<Project.Project, 'id' | 'createdAt' | 'updatedAt'>, Partial<Omit<Project.Project, 'id' | 'createdAt' | 'updatedAt'>>> {

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
      return rows.map(r => this.validate(r));
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
      return rows.map(r => this.validate(r));
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
        return this.validate(row);
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
      const [row] = await db.update(projectTable)
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
      const [row] = await db.update(projectTable)
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
