import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Replaces legacy Next.js static assets with the R2 copies. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "pages" SET "hero_image_url" = '/uploads/image/register-banner.jpg', "updated_at" = now() WHERE "slug" = 'register';
    UPDATE "pages_registration_steps"
    SET "image_url" = '/uploads/image/' || "id" || '.jpg'
    WHERE "id" IN ('register-step-1', 'register-step-2', 'register-step-3', 'register-step-4', 'register-step-5');
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
