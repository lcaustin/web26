import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Adds the legacy registration page's centered blue notice. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "registration_notice_ko" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "registration_notice_en" varchar;
    UPDATE "pages"
    SET "registration_notice_ko" = '주님의 교회 새가족 등록을 원하시는 분은\n새가족실로 오시면 안내해드리겠습니다.',
        "registration_notice_en" = 'If you would like to register as a new family, please visit the New Family Room for guidance.',
        "updated_at" = now()
    WHERE "slug" = 'register';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "registration_notice_ko";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "registration_notice_en";
  `)
}
