import { db } from "../connection";
import { projectTable, projectTechnologiesTable, technologyTable } from "../schema/project";
import { eq } from "drizzle-orm";

/**
 * Reusable query to get a project with all its connected technologies,
 * demonstrating how the query layer abstracts complex joins.
 */
export async function getProjectWithTechnologies(slug: string) {
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
    .map(r => r.technology)
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return {
    ...project,
    technologies,
  };
}
