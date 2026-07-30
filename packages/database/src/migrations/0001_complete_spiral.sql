ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_technology_id_pk" PRIMARY KEY("project_id","technology_id");--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_tag_id_pk" PRIMARY KEY("article_id","tag_id");--> statement-breakpoint
ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_experience_id_skill_id_pk" PRIMARY KEY("experience_id","skill_id");--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_media_id_pk" PRIMARY KEY("project_id","media_id");