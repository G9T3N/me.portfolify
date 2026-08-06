import { db } from "../connection";
import { projectTable, technologyTable, projectTechnologiesTable } from "../schema/project";
import { articleTable, tagTable, articleTagsTable } from "../schema/article";
import { profileTable } from "../schema/profile";
import { socialLinkTable } from "../schema/social";

async function seed() {
  console.log("🌱 Starting database seed...");

  // Idempotent Profile Creation
  const existingProfiles = await db.select().from(profileTable).limit(1);
  let profileId = existingProfiles[0]?.id;
  if (!profileId) {
    const [newProfile] = await db
      .insert(profileTable)
      .values({
        name: "John Doe",
        headline: "Principal Software Engineer",
        biography: "Passionate about building scalable systems and elegant user interfaces.",
        location: "San Francisco, CA",
        timezone: "America/Los_Angeles",
        availability: "open",
        contactEmail: "john.doe@example.com",
      })
      .returning();
    profileId = newProfile.id;
  }

  // Idempotent Social Links (FIXED: removed the duplicate unconditional insert statement)
  console.log("Seeding social links...");
  const socials = [
    { platform: "github", url: "https://github.com/johndoe", label: "GitHub" },
    { platform: "linkedin", url: "https://linkedin.com/in/johndoe", label: "LinkedIn" },
  ];
  for (const social of socials) {
    await db
      .insert(socialLinkTable)
      .values({ profileId, ...social })
      .onConflictDoNothing(); // Depends on a unique constraint, but without it we must select

    // Without unique constraint on URL, we manually check:
    const existing = await db
      .select()
      .from(socialLinkTable)
      .where(eq(socialLinkTable.url, social.url));
    if (existing.length === 0) {
      await db.insert(socialLinkTable).values({ profileId, ...social });
    }
  }

  // Idempotent Technologies
  console.log("Seeding technologies...");
  const techs = [
    { name: "TypeScript", slug: "typescript" },
    { name: "React", slug: "react" },
    { name: "PostgreSQL", slug: "postgresql" },
    { name: "Node.js", slug: "nodejs" },
  ];
  const techIds: Record<string, string> = {};
  for (const tech of techs) {
    const [upserted] = await db
      .insert(technologyTable)
      .values(tech)
      .onConflictDoUpdate({
        target: technologyTable.slug,
        set: { name: tech.name },
      })
      .returning();
    techIds[upserted.slug] = upserted.id;
  }

  // Idempotent Projects
  console.log("Seeding projects...");
  const projects = [
    {
      title: "MRERR Platform",
      slug: "mrerr-platform",
      summary: "A modern, high-performance portfolio and blog platform.",
      description:
        "Built with React Router v7, Drizzle, and ArkType. Features full SSR and static generation capabilities.",
      status: "published",
      isPublished: true,
      featured: true,
      publishedAt: new Date(),
    },
    {
      title: "Open Source AI Agent",
      slug: "os-ai-agent",
      summary: "An autonomous agent that helps developers refactor code.",
      description:
        "Leveraging LLMs to understand complex codebases and suggest architectural improvements.",
      status: "draft",
      isPublished: false,
      featured: false,
    },
  ];

  for (const proj of projects) {
    const [upsertedProj] = await db
      .insert(projectTable)
      .values(proj)
      .onConflictDoUpdate({
        target: projectTable.slug,
        set: {
          title: proj.title,
          summary: proj.summary,
          description: proj.description,
          status: proj.status,
          isPublished: proj.isPublished,
          featured: proj.featured,
        },
      })
      .returning();

    if (upsertedProj.slug === "mrerr-platform") {
      // Safely link technologies, ignoring duplicates due to new PK constraint
      await db
        .insert(projectTechnologiesTable)
        .values([
          { projectId: upsertedProj.id, technologyId: techIds["typescript"] },
          { projectId: upsertedProj.id, technologyId: techIds["react"] },
          { projectId: upsertedProj.id, technologyId: techIds["postgresql"] },
        ])
        .onConflictDoNothing();
    }
  }

  // Idempotent Tags
  console.log("Seeding tags...");
  const tags = [
    { name: "Software Architecture", slug: "architecture" },
    { name: "Web Development", slug: "web-development" },
  ];
  const tagIds: Record<string, string> = {};
  for (const tag of tags) {
    const [upserted] = await db
      .insert(tagTable)
      .values(tag)
      .onConflictDoUpdate({
        target: tagTable.slug,
        set: { name: tag.name },
      })
      .returning();
    tagIds[upserted.slug] = upserted.id;
  }

  // Idempotent Articles
  console.log("Seeding articles...");
  const articles = [
    {
      title: "Building Scalable Systems",
      slug: "building-scalable-systems",
      excerpt: "A deep dive into clean architecture and reliable persistence.",
      content:
        "This article discusses modular monorepos, domain boundaries, and strict validation using ArkType.",
      status: "published",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "Designing Robust APIs",
      slug: "designing-robust-apis",
      excerpt: "Best practices for writing type-safe APIs.",
      content:
        "Learn how to establish robust runtime validation boundaries using TypeScript and schemas.",
      status: "draft",
      isPublished: false,
    },
  ];

  for (const art of articles) {
    const [upsertedArt] = await db
      .insert(articleTable)
      .values(art)
      .onConflictDoUpdate({
        target: articleTable.slug,
        set: {
          title: art.title,
          excerpt: art.excerpt,
          content: art.content,
          status: art.status,
          isPublished: art.isPublished,
        },
      })
      .returning();

    if (upsertedArt.slug === "building-scalable-systems") {
      await db
        .insert(articleTagsTable)
        .values([
          { articleId: upsertedArt.id, tagId: tagIds["architecture"] },
          { articleId: upsertedArt.id, tagId: tagIds["web-development"] },
        ])
        .onConflictDoNothing();
    }
  }

  console.log("✅ Seed completed successfully!");

  // Crucial: close the database connection
  const connection = (global as any).__db_connection__;
  if (connection) {
    await connection.end();
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
