import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Adds CMS-managed training/ministry page fields and seeds the migrated pages. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_layout" AS ENUM('default', 'training');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_training_hero_style" AS ENUM('none', 'overlay', 'banner', 'feature');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "layout" "public"."enum_pages_layout" DEFAULT 'default';
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_hero_style" "public"."enum_pages_training_hero_style" DEFAULT 'none';
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_hero_title" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_hero_subtitle" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_panel_title" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_panel_subtitle" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_show_divider" boolean DEFAULT false;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_body" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_register_url" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_register_label" varchar DEFAULT '신청하기';
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_closed_message" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_video_search_keyword" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_video_title" varchar DEFAULT '영상';
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_video_subtitle" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "training_video_archive_label" varchar;

    INSERT INTO "pages" (
      "slug",
      "title_ko",
      "title_en",
      "icon",
      "subtitle_ko",
      "subtitle_en",
      "hero_image_url",
      "layout",
      "training_hero_style",
      "training_hero_title",
      "training_hero_subtitle",
      "training_panel_title",
      "training_panel_subtitle",
      "training_show_divider",
      "training_body",
      "training_register_url",
      "training_register_label",
      "training_closed_message",
      "training_video_search_keyword",
      "training_video_title",
      "training_video_subtitle",
      "training_video_archive_label",
      "updated_at",
      "created_at"
    ) VALUES (
      'coffeebreak',
      '커피 브레이크',
      'Coffee Break',
      'ti-cup',
      '',
      'Coffee Break',
      '/uploads/image/603729a21aa7f2076ceba837.jpeg',
      'training',
      'overlay',
      '커피 브레이크',
      '주님과 커피 한잔 하실래요?',
      'COFFEE BREAK',
      null,
      false,
      $$커피브레이크 소그룹 성경공부는 1970년대 CRC(미국 개혁장로교회)에서 시작하여 현재 55개 다른 교단에서도 전도용 성경공부로 지금까지 널리 확산되어 왔습니다.

커피브레이크는 하나님의 말씀을 재미있고 효과적으로 받을 수 있도록 돕는 성경발견학습 성경공부로써 많은 사람들의 삶을 변화시키는 귀중한 도구로, 또 전도와 인도자 훈련을 목적으로 사용되고 있습니다.

주님의 교회에서도 다양한 연령층의 커피브레이크 성경공부가 일년에 두 차례 3월과 9월에 12주 과정으로 열리고 있습니다.$$,
      'https://docs.google.com/forms/d/e/1FAIpQLSe1l09TRagLlRqaYE3cdIWjnN9vWDabT2Tn1RKAbr5ygH1FRg/viewform?usp=pp_url',
      '신청하기',
      null,
      '커피브레이크',
      '영상',
      '커피브레이크 간증',
      '커피브레이크 · TESTIMONY',
      now(),
      now()
    ), (
      'biblepanorama',
      '신구약 맥잡기',
      'Bible Panorama',
      'ti-book',
      '',
      'Bible Panorama',
      '/uploads/image/6037310a1aa7f2076ceba83b.jpeg',
      'training',
      'feature',
      null,
      null,
      'BIBLE PANORAMA',
      null,
      false,
      $$무턱대고 성경을 읽기에 성경은 너무 길고 방대한 책입니다. 많은 성도님들이 성경을 알기를 원하지만 낯선 지명, 발음하기도 어려운 이름들, 이어지지 않는 줄거리등으로 많은 어려움을 호소하고 있습니다.

‘신구약 맥잡기’는 성경 전체의 흐름과 구조를 파악하도록 도와주어 성경 전반에 대한 이해를 돕는 성경공부입니다.

주님의 교회에서는 일 년에 두 차례 3월과 9월에 신약 맥잡기, 구약맥잡기가 8-10주 과정으로 열리고 있습니다.$$,
      null,
      '신청하기',
      '신청 기간이 아닙니다.',
      null,
      '영상',
      null,
      null,
      now(),
      now()
    ), (
      'crown-finance',
      '크라운 재정교실',
      'Crown Financial Class',
      'ti-coins',
      '',
      'Crown Financial Class',
      '/uploads/image/603734471aa7f2076ceba83d.jpeg',
      'training',
      'banner',
      null,
      null,
      '크라운 재정교실 사역',
      '(Crown Financial Ministries ®)',
      true,
      $$래리 버킷과 하워드 데이톤에 의해 2000년도에 설립된 크라운 재정 사역은 전세계 사람들이 성경적 재정 원칙을 배우고 적용하고 가르칠 수 있도록 훈련하는 재정 사역단체입니다.

주님의 교회에서는 모든 사람들이 성경적 관점으로 재정을 관리할 수 있도록 크라운 재정교실을 통해 훈련하고 있습니다.

삶의 모든 영역에서 하나님의 재정 원칙대로 신실하게 살아가는 것을 통해 삶의 변화를 일으키는데 그 목적이 있습니다.$$,
      'https://forms.gle/o1gYWQfPxU5cah3J9',
      '신청하기',
      null,
      '크라운재정교실',
      '영상',
      '크라운 재정교실 간증',
      '크라운 재정교실 · TESTIMONY',
      now(),
      now()
    ), (
      'gaonschool',
      '가온토요학교',
      'Gaon School',
      'ti-school',
      '',
      'Gaon Saturday School',
      null,
      'training',
      'none',
      null,
      null,
      'GAON SATURDAY SCHOOL',
      null,
      false,
      $$세상의 중심에서 빛이 되는 미래의 리더를 교육합니다.

"가온"은 순수 한글로 "가운데"라는 뜻을 가지고 있으며, 가온학교는 세상의 가운데서 빛을 발하는 미래의 리더들을 교육하고자 세워졌습니다.

일시: 매주 토요일 오전 9:30 – 오후 1:30

수업료: 한 학기 $300 (다자녀, 사역자 자녀 할인 있음)

문의: GAON@LCAUSTIN.ORG$$,
      null,
      '신청하기',
      null,
      null,
      '영상',
      null,
      null,
      now(),
      now()
    )
    ON CONFLICT ("slug") DO UPDATE SET
      "title_ko" = excluded."title_ko",
      "title_en" = excluded."title_en",
      "icon" = excluded."icon",
      "subtitle_ko" = excluded."subtitle_ko",
      "subtitle_en" = excluded."subtitle_en",
      "hero_image_url" = excluded."hero_image_url",
      "layout" = excluded."layout",
      "training_hero_style" = excluded."training_hero_style",
      "training_hero_title" = excluded."training_hero_title",
      "training_hero_subtitle" = excluded."training_hero_subtitle",
      "training_panel_title" = excluded."training_panel_title",
      "training_panel_subtitle" = excluded."training_panel_subtitle",
      "training_show_divider" = excluded."training_show_divider",
      "training_body" = excluded."training_body",
      "training_register_url" = excluded."training_register_url",
      "training_register_label" = excluded."training_register_label",
      "training_closed_message" = excluded."training_closed_message",
      "training_video_search_keyword" = excluded."training_video_search_keyword",
      "training_video_title" = excluded."training_video_title",
      "training_video_subtitle" = excluded."training_video_subtitle",
      "training_video_archive_label" = excluded."training_video_archive_label",
      "updated_at" = now();
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "pages" WHERE "slug" IN ('coffeebreak', 'biblepanorama', 'crown-finance', 'gaonschool');

    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_video_archive_label";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_video_subtitle";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_video_title";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_video_search_keyword";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_closed_message";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_register_label";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_register_url";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_body";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_show_divider";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_panel_subtitle";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_panel_title";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_hero_subtitle";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_hero_title";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "training_hero_style";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "layout";

    DROP TYPE IF EXISTS "public"."enum_pages_training_hero_style";
    DROP TYPE IF EXISTS "public"."enum_pages_layout";
  `)
}
