import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Seeds the legacy Mission page as a CMS-managed Training & Ministry page. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "mission_overseas" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "mission_partners" varchar;

    INSERT INTO "pages" (
      "slug", "title_ko", "title_en", "icon", "subtitle_ko", "subtitle_en",
      "hero_image_url", "layout", "training_hero_style", "training_panel_title",
      "training_body", "mission_overseas", "mission_partners", "updated_at", "created_at"
    ) VALUES (
      'training',
      '선교지',
      'Mission',
      'ti-world',
      '해외선교',
      'Mission Field',
      '/uploads/image/603734de1aa7f2076ceba83f.jpeg',
      'mission',
      'banner',
      '선교지',
      $$‘어스틴 주님의교회’는 땅 끝까지 모든 민족에게 복음을 전파하라는 주님의 말씀에 순종하여,
다른 나라로 복음을 들고 나가는 선교사님들을 지원하고 있습니다.$$,
      $$A국 | 윤성철 선교사 |
태국 | 전은주, 김상수 선교사 | 샘물, 나눔, 힐링, 헷세드
C국 | 임도마, 제헌신 선교사 | 감사, 승리, 예사랑, 온유
하이티 | 박동한, 이성한 선교사 | 예본, 충성, 마라나타, 하람
브라질 | 김창연 선교사 | 올리브, 샬롬, 씨앗, 대학부
차드 | 김영섭 선교사 | 오늘, 섬김, 사랑, 뉴비전
D국 | 김재문 선교사 | 예닮, 자이온, 열방, 위트
E국 | 새벽이슬 선교사 | 믿음, 한울, 만나, 세미한
우즈벡 | 강세르게이 | 함께, 돌봄, 에벤에셀, 주바라기
일본 | 문일배 | 우리, 은혜, 새소망
페루 | 윤애경 | 바로그, 예인, 기쁨, 청년부
카자흐스탄 | 김선종 선교사 | 열매, 예감, 충만, 베데스다$$,
      $$알라스카 이글리버교회 | 이홍래 목사
Bridge 미니스트리 | 김영수 간사
C.R.C 교단선교회 |
멕시코 | Rancho Dos Countries$$,
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
      "training_panel_title" = excluded."training_panel_title",
      "training_body" = excluded."training_body",
      "mission_overseas" = excluded."mission_overseas",
      "mission_partners" = excluded."mission_partners",
      "updated_at" = now();
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "pages" WHERE "slug" = 'mission';
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "mission_partners";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "mission_overseas";
  `)
}
