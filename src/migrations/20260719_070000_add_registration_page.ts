import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const steps = [
  ['register-step-1', 1, '/uploads/image/register-step-1.jpg', '등록카드 작성', 'Complete a registration card'],
  ['register-step-2', 2, '/uploads/image/register-step-2.jpg', '교적번호 부여, 구역배정', 'Receive a member number and community assignment'],
  ['register-step-3', 3, '/uploads/image/register-step-3.jpg', '담임목사 심방', 'Pastoral visit'],
  ['register-step-4', 4, '/uploads/image/register-step-4.jpg', '멤버쉽 훈련', 'Membership training'],
  ['register-step-5', 5, '/uploads/image/register-step-5.jpg', '새가족 환영회', 'New family welcome gathering'],
] as const

/** Migrates the legacy new-family registration page into the Pages collection. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "enum_pages_layout" ADD VALUE IF NOT EXISTS 'registration';
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "registration_description_ko" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "registration_description_en" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "registration_form_url" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "registration_form_label" varchar DEFAULT '온라인 등록카드 작성';

    CREATE TABLE IF NOT EXISTS "pages_registration_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_url" varchar,
      "title_ko" varchar NOT NULL,
      "title_en" varchar NOT NULL
    );
    DO $$ BEGIN
      ALTER TABLE "pages_registration_steps"
        ADD CONSTRAINT "pages_registration_steps_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    CREATE INDEX IF NOT EXISTS "pages_registration_steps_order_idx" ON "pages_registration_steps" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_registration_steps_parent_id_idx" ON "pages_registration_steps" USING btree ("_parent_id");

    INSERT INTO "pages" (
      "slug", "title_ko", "title_en", "icon", "subtitle_ko", "subtitle_en", "layout", "hero_image_url",
      "callout_tagline_ko", "callout_tagline_en", "callout_message_ko", "callout_message_en",
      "registration_description_ko", "registration_description_en", "registration_form_url", "registration_form_label"
    ) VALUES (
      'register', '새가족 등록', 'New Family Registration', 'ti-heart-handshake', '처음 오셨나요?', 'Are you new here?', 'registration', '/uploads/image/register-banner.jpg',
      '주님의 교회를 방문해 주신\n여러분을 진심으로 환영합니다.', 'Welcome to Lord''s Church of Austin.', '축복합니다. 사랑합니다. 환영합니다!', 'Bless you. Love you. Welcome!',
      '주님의 교회 새가족 등록 방법을 안내해드리겠습니다.', 'Here is how to register as a new family at Lord''s Church.', 'https://docs.google.com/forms/d/e/1FAIpQLSfUo8b2tUew3phIceZ45jiO_SLp7W2Kdz20tKNEywHwjgSjdg/viewform', '온라인 등록카드 작성'
    ) ON CONFLICT ("slug") DO UPDATE SET
      "title_ko" = EXCLUDED."title_ko", "title_en" = EXCLUDED."title_en", "icon" = EXCLUDED."icon", "subtitle_ko" = EXCLUDED."subtitle_ko", "subtitle_en" = EXCLUDED."subtitle_en", "layout" = EXCLUDED."layout", "hero_image_url" = EXCLUDED."hero_image_url",
      "callout_tagline_ko" = EXCLUDED."callout_tagline_ko", "callout_tagline_en" = EXCLUDED."callout_tagline_en", "callout_message_ko" = EXCLUDED."callout_message_ko", "callout_message_en" = EXCLUDED."callout_message_en",
      "registration_description_ko" = EXCLUDED."registration_description_ko", "registration_description_en" = EXCLUDED."registration_description_en", "registration_form_url" = EXCLUDED."registration_form_url", "registration_form_label" = EXCLUDED."registration_form_label", "updated_at" = now();
  `)

  for (const [id, order, imageUrl, titleKo, titleEn] of steps) {
    await db.execute(sql`
      INSERT INTO "pages_registration_steps" ("_order", "_parent_id", "id", "image_url", "title_ko", "title_en")
      SELECT ${order}, "id", ${id}, ${imageUrl}, ${titleKo}, ${titleEn} FROM "pages" WHERE "slug" = 'register'
      ON CONFLICT ("id") DO UPDATE SET
        "_order" = EXCLUDED."_order", "_parent_id" = EXCLUDED."_parent_id", "image_url" = EXCLUDED."image_url", "title_ko" = EXCLUDED."title_ko", "title_en" = EXCLUDED."title_en";
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "pages" WHERE "slug" = 'register';
    DROP TABLE IF EXISTS "pages_registration_steps" CASCADE;
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "registration_description_ko";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "registration_description_en";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "registration_form_url";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "registration_form_label";
  `)
}
