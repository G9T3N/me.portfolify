import { db } from "../connection";
import { projectTable, projectTechnologiesTable, technologyTable } from "../schema/project";
import { eq } from "drizzle-orm";
import { type } from "arktype";
import { Uuid, Slug, Url, Markdown, ImageUrl } from "@mrerr/domain/src/core";
import { PROJECT_STATUSES } from "@mrerr/domain/src/project/constants";
import { mapValidationError, isArkErrors } from "../repositories/errors";

export const technologySummarySchema = type({
  id: Uuid,
  name: "string > 0",
  slug: Slug,
});

export const projectWithTechnologiesSchema = type({
  id: Uuid,
  createdAt: "Date",
  updatedAt: "Date",
  isPublished: "boolean",
  "publishedAt?": "Date | null",
  title: "string > 0",
  slug: Slug,
  summary: "string",
  description: Markdown,
  "repository?": Url.or("null"),
  "demo?": Url.or("null"),
  images: ImageUrl.array(),
  featured: "boolean",
  status: type("string").narrow((s: string): s is (typeof PROJECT_STATUSES)[number] =>
    PROJECT_STATUSES.includes(s as any),
  ),
  technologies: technologySummarySchema.array(),
});

export type ProjectWithTechnologies = typeof projectWithTechnologiesSchema.infer;

/**
 * Reusable query to get a project with all its connected technologies,
 * demonstrating how the query layer abstracts complex joins.
 */
export async function getProjectWithTechnologies(
  slug: string,
): Promise<ProjectWithTechnologies | null> {
  const rows = await db
    .select({
      project: projectTable,
      technology: technologyTable,
    })
    .from(projectTable)
    .leftJoin(projectTechnologiesTable, eq(projectTable.id, projectTechnologiesTable.projectId))
    .leftJoin(technologyTable, eq(projectTechnologiesTable.technologyId, technologyTable.id))
    .where(eq(projectTable.slug, slug));

  if (rows.length === 0) return null;

  const project = rows[0].project;
  const technologies = rows
    .map((r) => r.technology)
    .filter((t): t is NonNullable<typeof t> => t !== null);

  const candidate = {
    ...project,
    technologies,
  };

  const validated = projectWithTechnologiesSchema(candidate);
  if (isArkErrors(validated)) {
    throw mapValidationError(
      validated,
      "database-to-domain",
      "ProjectWithTechnologies",
      "getProjectWithTechnologies",
    );
  }
  if (validated instanceof Error) {
    throw mapValidationError(
      validated,
      "database-to-domain",
      "ProjectWithTechnologies",
      "getProjectWithTechnologies",
    );
  }

  return validated as ProjectWithTechnologies;
}
